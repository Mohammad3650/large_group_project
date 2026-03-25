{
  description = "StudySync dev flake for Django REST backend + React/Vite frontend";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachSystem [ "x86_64-linux" "aarch64-darwin" ] (system:
      let
        pkgs = import nixpkgs { inherit system; };

        python = pkgs.python3;
        node = pkgs.nodejs_20;

        runtimeInputs = with pkgs; [
          bash
          coreutils
          git
          gnugrep
          findutils
          gawk
          node
          python
          sqlite
        ];

        mkApp = script: {
          type = "app";
          program = "${script}/bin/${script.name}";
          meta = {
            description = "StudySync flake entrypoint";
          };
        };

        rootChecks = ''
          require_root() {
            local root="$1"

            if [ ! -f "$root/flake.nix" ]; then
              echo "ERROR: flake.nix not found in $root"
              echo "Run this from the repository root."
              exit 1
            fi

            if [ ! -d "$root/backend" ]; then
              echo "ERROR: backend/ directory not found in $root"
              exit 1
            fi

            if [ ! -d "$root/frontend" ]; then
              echo "ERROR: frontend/ directory not found in $root"
              exit 1
            fi
          }
        '';

        initScript = pkgs.writeShellApplication {
          name = "studysync-init";
          runtimeInputs = runtimeInputs;
          text = ''
            set -euo pipefail
            ${rootChecks}

            ROOT="$PWD"
            BACKEND_DIR="$ROOT/backend"
            FRONTEND_DIR="$ROOT/frontend"
            REQUIREMENTS_FILE="$ROOT/requirements.txt"
            VENV_DIR="$BACKEND_DIR/venv"

            require_root "$ROOT"

            if [ ! -f "$REQUIREMENTS_FILE" ]; then
              echo "ERROR: requirements.txt not found at $REQUIREMENTS_FILE"
              exit 1
            fi

            echo "==> StudySync initialisation"
            echo "==> Platform: ${system}"
            echo "==> Repo root: $ROOT"
            echo

            echo "==> Creating backend virtual environment at backend/venv"
            ${python}/bin/python -m venv "$VENV_DIR"

            echo "==> Installing backend Python dependencies"
            "$VENV_DIR/bin/python" -m pip install --upgrade pip
            "$VENV_DIR/bin/pip" install -r "$REQUIREMENTS_FILE"

            echo
            echo "==> Applying Django migrations"
            (
              cd "$BACKEND_DIR"
              "$VENV_DIR/bin/python" manage.py migrate
            )

            echo
            echo "==> Installing frontend npm dependencies"
            (
            cd "$FRONTEND_DIR"
            if [ -f package-lock.json ]; then
                npm ci
            else
                npm install
            fi
            )

            echo
            echo "==> Seeding backend database"
            (
              cd "$BACKEND_DIR"
              "$VENV_DIR/bin/python" manage.py seed
            )

            echo
            echo "==> Initialisation complete"
            echo "Next steps:"
            echo "  nix run .#tests"
            echo "  nix run .#run"
          '';
        };

        runScript = pkgs.writeShellApplication {
          name = "studysync-run";
          runtimeInputs = runtimeInputs;
          text = ''
            set -euo pipefail
            ${rootChecks}

            ROOT="$PWD"
            BACKEND_DIR="$ROOT/backend"
            FRONTEND_DIR="$ROOT/frontend"
            VENV_DIR="$BACKEND_DIR/venv"

            require_root "$ROOT"

            if [ ! -x "$VENV_DIR/bin/python" ]; then
              echo "ERROR: backend virtual environment not found at $VENV_DIR"
              echo "Run: nix run .#init"
              exit 1
            fi

            cleanup() {
              echo
              echo "==> Stopping StudySync services..."
              if [ -n "''${BACKEND_PID:-}" ] && kill -0 "$BACKEND_PID" 2>/dev/null; then
                kill "$BACKEND_PID" 2>/dev/null || true
              fi
              if [ -n "''${FRONTEND_PID:-}" ] && kill -0 "$FRONTEND_PID" 2>/dev/null; then
                kill "$FRONTEND_PID" 2>/dev/null || true
              fi
              wait || true
            }

            trap cleanup INT TERM EXIT

            echo "==> Starting StudySync"
            echo "==> Backend: http://127.0.0.1:8000"
            echo "==> Frontend: http://127.0.0.1:5173"
            echo

            (
              cd "$BACKEND_DIR"
              exec "$VENV_DIR/bin/python" manage.py runserver
            ) &
            BACKEND_PID=$!

            sleep 2

            (
              cd "$FRONTEND_DIR"
              exec npm run dev
            ) &
            FRONTEND_PID=$!

            wait -n "$BACKEND_PID" "$FRONTEND_PID"
          '';
        };

        testsScript = pkgs.writeShellApplication {
          name = "studysync-tests";
          runtimeInputs = runtimeInputs;
          text = ''
            set -euo pipefail
            ${rootChecks}

            ROOT="$PWD"
            BACKEND_DIR="$ROOT/backend"
            FRONTEND_DIR="$ROOT/frontend"
            VENV_DIR="$BACKEND_DIR/venv"
            COVERAGE_ROOT="$ROOT/coverage"
            BACKEND_COVERAGE_DIR="$COVERAGE_ROOT/backend"
            FRONTEND_COVERAGE_DIR="$FRONTEND_DIR/coverage"

            require_root "$ROOT"

            if [ ! -x "$VENV_DIR/bin/python" ]; then
              echo "ERROR: backend virtual environment not found at $VENV_DIR"
              echo "Run: nix run .#init"
              exit 1
            fi

            mkdir -p "$BACKEND_COVERAGE_DIR"

            echo "==> Running backend tests"
            (
              cd "$BACKEND_DIR"
              "$VENV_DIR/bin/coverage" erase
              "$VENV_DIR/bin/coverage" run manage.py test
              "$VENV_DIR/bin/coverage" report -m
              "$VENV_DIR/bin/coverage" xml -o "$BACKEND_COVERAGE_DIR/coverage.xml"
              "$VENV_DIR/bin/coverage" html -d "$BACKEND_COVERAGE_DIR/html"
            )

            echo
            echo "==> Running frontend tests"
            (
              cd "$FRONTEND_DIR"
              npm run test
              npm run coverage
            )

            echo
            echo "==> Coverage output locations"
            echo "  Backend XML:  $BACKEND_COVERAGE_DIR/coverage.xml"
            echo "  Backend HTML: $BACKEND_COVERAGE_DIR/html/index.html"

            if [ -d "$FRONTEND_COVERAGE_DIR" ]; then
              echo "  Frontend:     $FRONTEND_COVERAGE_DIR"
            else
              echo "  Frontend:     frontend coverage directory not found"
            fi

            echo
            echo "==> Tests and coverage completed"
          '';
        };

        seedScript = pkgs.writeShellApplication {
          name = "studysync-seed";
          runtimeInputs = runtimeInputs;
          text = ''
            set -euo pipefail
            ${rootChecks}

            ROOT="$PWD"
            BACKEND_DIR="$ROOT/backend"
            VENV_DIR="$BACKEND_DIR/venv"

            require_root "$ROOT"

            if [ ! -x "$VENV_DIR/bin/python" ]; then
              echo "ERROR: backend virtual environment not found at $VENV_DIR"
              echo "Run: nix run .#init"
              exit 1
            fi

            echo "==> Seeding backend database"
            (
              cd "$BACKEND_DIR"
              "$VENV_DIR/bin/python" manage.py seed
            )

            echo "==> Seeding complete"
          '';
        };

        unseedScript = pkgs.writeShellApplication {
          name = "studysync-unseed";
          runtimeInputs = runtimeInputs;
          text = ''
            set -euo pipefail
            ${rootChecks}

            ROOT="$PWD"
            BACKEND_DIR="$ROOT/backend"
            VENV_DIR="$BACKEND_DIR/venv"

            require_root "$ROOT"

            if [ ! -x "$VENV_DIR/bin/python" ]; then
              echo "ERROR: backend virtual environment not found at $VENV_DIR"
              echo "Run: nix run .#init"
              exit 1
            fi

            echo "==> Unseeding backend database"
            (
              cd "$BACKEND_DIR"
              "$VENV_DIR/bin/python" manage.py unseed
            )

            echo "==> Unseeding complete"
          '';
        };
      in
      {
        apps = {
          init = mkApp initScript;
          run = mkApp runScript;
          tests = mkApp testsScript;
          seed = mkApp seedScript;
          unseed = mkApp unseedScript;
        };

        devShells.default = pkgs.mkShell {
          packages = runtimeInputs;
          shellHook = ''
            echo "StudySync development shell"
            echo "Available entrypoints:"
            echo "  nix run .#init"
            echo "  nix run .#run"
            echo "  nix run .#tests"
            echo "  nix run .#seed"
            echo "  nix run .#unseed"
          '';
        };
      });
}