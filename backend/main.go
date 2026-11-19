package main

import (
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log"
	"net"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"sync"
	"time"
)

var mu sync.Mutex

type State struct {
	Users          []map[string]any `json:"users"`
	Products       []map[string]any `json:"products"`
	Sales          []map[string]any `json:"sales"`
	StockMovements []map[string]any `json:"stockMovements"`
}

func dataFile() string {
	dir := os.Getenv("DATA_DIR")
	if dir == "" {
		dir = "backend/data"
	}
	return filepath.Join(dir, "store.json")
}
func validate(s State) error {
	if s.Users == nil || s.Products == nil || s.Sales == nil || s.StockMovements == nil {
		return errors.New("faltan colecciones")
	}
	for _, u := range s.Users {
		if _, ok := u["id"].(string); !ok {
			return errors.New("usuario sin id")
		}
		if _, ok := u["email"].(string); !ok {
			return errors.New("usuario sin correo")
		}
		if u["role"] != "admin" && u["role"] != "seller" {
			return errors.New("rol inválido")
		}
	}
	for _, p := range s.Products {
		if _, ok := p["id"].(string); !ok {
			return errors.New("producto sin id")
		}
		for _, key := range []string{"stock", "salePrice"} {
			n, ok := p[key].(float64)
			if !ok || n < 0 {
				return fmt.Errorf("%s inválido", key)
			}
		}
	}
	return nil
}
func readState() (State, error) {
	var s State
	b, e := os.ReadFile(dataFile())
	if e != nil {
		return s, e
	}
	e = json.Unmarshal(b, &s)
	if e != nil {
		return s, e
	}
	return s, validate(s)
}
func writeState(s State) error {
	if e := validate(s); e != nil {
		return e
	}
	p := dataFile()
	if e := os.MkdirAll(filepath.Dir(p), 0700); e != nil {
		return e
	}
	b, e := json.MarshalIndent(s, "", "  ")
	if e != nil {
		return e
	}
	f, e := os.CreateTemp(filepath.Dir(p), "store-*.tmp")
	if e != nil {
		return e
	}
	defer os.Remove(f.Name())
	if _, e = f.Write(b); e != nil {
		f.Close()
		return e
	}
	if e = f.Close(); e != nil {
		return e
	}
	return os.Rename(f.Name(), p)
}
func respond(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(v)
}
func errJSON(w http.ResponseWriter, status int, msg string) {
	respond(w, status, map[string]string{"message": msg})
}
func localOnly(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if origin := r.Header.Get("Origin"); origin != "" {
			u, err := http.NewRequest("GET", origin, nil)
			if err != nil {
				errJSON(w, 403, "Origen inválido")
				return
			}
			host := u.URL.Hostname()
			if host != "localhost" && host != "127.0.0.1" {
				errJSON(w, 403, "Origen no autorizado")
				return
			}
		}
		next(w, r)
	}
}
func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "3001"
	}
	if _, e := strconv.Atoi(port); e != nil {
		log.Fatal("PORT inválido")
	}
	mux := http.NewServeMux()
	mux.HandleFunc("GET /api/health", func(w http.ResponseWriter, r *http.Request) { respond(w, 200, map[string]string{"status": "ok"}) })
	mux.HandleFunc("GET /api/state", localOnly(func(w http.ResponseWriter, r *http.Request) {
		mu.Lock()
		defer mu.Unlock()
		s, e := readState()
		if e != nil {
			log.Print(e)
			errJSON(w, 500, "Error al leer los datos")
			return
		}
		respond(w, 200, s)
	}))
	mux.HandleFunc("PUT /api/state", localOnly(func(w http.ResponseWriter, r *http.Request) {
		r.Body = http.MaxBytesReader(w, r.Body, 2<<20)
		defer r.Body.Close()
		var s State
		dec := json.NewDecoder(r.Body)
		if e := dec.Decode(&s); e != nil {
			errJSON(w, 400, "JSON inválido")
			return
		}
		var extra any
		if e := dec.Decode(&extra); e != io.EOF {
			errJSON(w, 400, "Contenido adicional inválido")
			return
		}
		if e := validate(s); e != nil {
			errJSON(w, 400, "Estado inválido: "+e.Error())
			return
		}
		mu.Lock()
		defer mu.Unlock()
		if e := writeState(s); e != nil {
			log.Print(e)
			errJSON(w, 500, "No se pudieron guardar los datos")
			return
		}
		respond(w, 200, map[string]bool{"saved": true})
	}))
	mux.HandleFunc("POST /api/auth/login", localOnly(func(w http.ResponseWriter, r *http.Request) {
		r.Body = http.MaxBytesReader(w, r.Body, 64<<10)
		defer r.Body.Close()
		var req struct {
			Email    string `json:"email"`
			Password string `json:"password"`
		}
		if json.NewDecoder(r.Body).Decode(&req) != nil || strings.TrimSpace(req.Email) == "" || req.Password == "" {
			errJSON(w, 400, "Ingrese su correo y contraseña")
			return
		}
		mu.Lock()
		defer mu.Unlock()
		s, e := readState()
		if e != nil {
			errJSON(w, 500, "Error al leer los datos")
			return
		}
		for i, u := range s.Users {
			email, _ := u["email"].(string)
			if strings.EqualFold(email, strings.TrimSpace(req.Email)) {
				if u["status"] != "active" {
					errJSON(w, 403, "La cuenta se encuentra inactiva")
					return
				}
				pass := os.Getenv("DEMO_PASSWORD")
				if pass == "" {
					pass = "demo123"
				}
				if req.Password != pass {
					errJSON(w, 401, "Contraseña incorrecta")
					return
				}
				u["lastLogin"] = "Hoy, " + time.Now().Format("15:04")
				s.Users[i] = u
				if e := writeState(s); e != nil {
					errJSON(w, 500, "Error al guardar el acceso")
					return
				}
				respond(w, 200, map[string]any{"user": u})
				return
			}
		}
		errJSON(w, 401, "Usuario no registrado en el sistema")
	}))
	dist := "frontend/dist"
	mux.HandleFunc("GET /", func(w http.ResponseWriter, r *http.Request) {
		if strings.HasPrefix(r.URL.Path, "/api/") {
			http.NotFound(w, r)
			return
		}
		p := filepath.Clean(strings.TrimPrefix(r.URL.Path, "/"))
		if p == "." {
			p = "index.html"
		}
		full := filepath.Join(dist, p)
		if st, e := os.Stat(full); e == nil && !st.IsDir() {
			http.ServeFile(w, r, full)
			return
		}
		http.ServeFile(w, r, filepath.Join(dist, "index.html"))
	})
	server := &http.Server{Addr: net.JoinHostPort("127.0.0.1", port), Handler: mux, ReadHeaderTimeout: 5 * time.Second}
	log.Printf("Útiles Express Go en http://localhost:%s", port)
	log.Fatal(server.ListenAndServe())
}
