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

        libPath = pkgs.lib.makeLibraryPath [ pkgs.stdenv.cc.cc.lib ];

        backendRequirements = pkgs.writeText "requirements.txt" ''
            asgiref==3.11.1
            Django==5.2.7
            django-cors-headers==4.9.0
            djangorestframework==3.16.1
            djangorestframework_simplejwt==5.5.1
            psycopg2-binary==2.9.11
            PyJWT==2.11.0
            python-dotenv==1.2.1
            pytz==2025.2
            sqlparse==0.5.5
            tzdata==2025.3
            coverage==7.13.4
            icalendar==5.0.11
            Faker==40.11.1
            '';

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
          stdenv.cc.cc.lib
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

            export LD_LIBRARY_PATH="${libPath}''${LD_LIBRARY_PATH:+:$LD_LIBRARY_PATH}"

            ROOT="$PWD"
            BACKEND_DIR="$ROOT/backend"
            FRONTEND_DIR="$ROOT/frontend"
            REQUIREMENTS_FILE="$BACKEND_DIR/requirements.txt"
            VENV_DIR="$BACKEND_DIR/venv"

            require_root "$ROOT"

            echo "==> StudySync initialisation"
            echo "==> Platform: ${system}"
            echo "==> Repo root: $ROOT"
            echo

            echo "==> Syncing backend requirements"
            cp "${backendRequirements}" "$REQUIREMENTS_FILE"

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

            export LD_LIBRARY_PATH="${libPath}''${LD_LIBRARY_PATH:+:$LD_LIBRARY_PATH}"

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
            set -uo pipefail
            ${rootChecks}

            export LD_LIBRARY_PATH="${libPath}''${LD_LIBRARY_PATH:+:$LD_LIBRARY_PATH}"

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

            backend_status=0
            frontend_status=0

            echo "==> Running backend tests"
            (
              cd "$BACKEND_DIR"
              "$VENV_DIR/bin/coverage" erase
              "$VENV_DIR/bin/coverage" run manage.py test
              "$VENV_DIR/bin/coverage" report -m
              "$VENV_DIR/bin/coverage" xml -o "$BACKEND_COVERAGE_DIR/coverage.xml"
              "$VENV_DIR/bin/coverage" html -d "$BACKEND_COVERAGE_DIR/html"
            ) || backend_status=$?

            echo
            echo "==> Running frontend tests"
            (
              cd "$FRONTEND_DIR"
              npm run coverage
            ) || frontend_status=$?

            echo
            echo "==> Coverage output locations"

            if [ -f "$BACKEND_COVERAGE_DIR/coverage.xml" ]; then
              echo "  Backend XML:  $BACKEND_COVERAGE_DIR/coverage.xml"
            else
              echo "  Backend XML:  not generated"
            fi

            if [ -d "$BACKEND_COVERAGE_DIR/html" ]; then
              echo "  Backend HTML: $BACKEND_COVERAGE_DIR/html/index.html"
            else
              echo "  Backend HTML: not generated"
            fi

            if [ -d "$FRONTEND_COVERAGE_DIR" ]; then
              echo "  Frontend:     $FRONTEND_COVERAGE_DIR"
            else
              echo "  Frontend:     frontend coverage directory not found"
            fi

            echo
            if [ "$backend_status" -eq 0 ] && [ "$frontend_status" -eq 0 ]; then
              echo "==> All tests passed"
              exit 0
            fi

            echo "==> Some tests failed"
            echo "  Backend exit code:  $backend_status"
            echo "  Frontend exit code: $frontend_status"
            exit 1
          '';
        };

        seedScript = pkgs.writeShellApplication {
          name = "studysync-seed";
          runtimeInputs = runtimeInputs;
          text = ''
            set -euo pipefail
            ${rootChecks}

            export LD_LIBRARY_PATH="${libPath}''${LD_LIBRARY_PATH:+:$LD_LIBRARY_PATH}"

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

            export LD_LIBRARY_PATH="${libPath}''${LD_LIBRARY_PATH:+:$LD_LIBRARY_PATH}"

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
            export LD_LIBRARY_PATH="${libPath}''${LD_LIBRARY_PATH:+:$LD_LIBRARY_PATH}"
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