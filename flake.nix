{
  description = "StudySync development flake for Django + React/Vite";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachSystem [ "x86_64-linux" "aarch64-darwin" ] (system:
      let
        pkgs = import nixpkgs {
          inherit system;
        };

        python = pkgs.python3;

        runtimeInputs = with pkgs; [
          bash
          coreutils
          git
          nodejs
          python
          sqlite
        ];

        initScript = pkgs.writeShellApplication {
          name = "studysync-init";
          runtimeInputs = runtimeInputs;
          text = ''
            set -euo pipefail

            ROOT="$(pwd)"
            BACKEND_DIR="$ROOT/backend"
            FRONTEND_DIR="$ROOT/frontend"
            REQUIREMENTS_FILE="$ROOT/requirements.txt"
            VENV_DIR="$BACKEND_DIR/venv"

            if [ ! -d "$BACKEND_DIR" ]; then
              echo "Error: backend directory not found at $BACKEND_DIR"
              exit 1
            fi

            if [ ! -d "$FRONTEND_DIR" ]; then
              echo "Error: frontend directory not found at $FRONTEND_DIR"
              exit 1
            fi

            if [ ! -f "$REQUIREMENTS_FILE" ]; then
              echo "Error: requirements.txt not found at $REQUIREMENTS_FILE"
              exit 1
            fi

            echo "Creating Python virtual environment in backend/venv..."
            ${python}/bin/python -m venv "$VENV_DIR"

            echo "Installing backend dependencies..."
            . "$VENV_DIR/bin/activate"
            python -m pip install --upgrade pip
            pip install -r "$REQUIREMENTS_FILE"

            echo "Applying Django migrations..."
            cd "$BACKEND_DIR"
            python manage.py migrate

            echo "Seeding backend database..."
            python manage.py seed

            echo "Installing frontend dependencies..."
            cd "$FRONTEND_DIR"
            npm install

            echo "StudySync initialisation complete."
          '';
        };

        runScript = pkgs.writeShellApplication {
          name = "studysync-run";
          runtimeInputs = runtimeInputs;
          text = ''
            set -euo pipefail

            ROOT="$(pwd)"
            BACKEND_DIR="$ROOT/backend"
            FRONTEND_DIR="$ROOT/frontend"
            VENV_DIR="$BACKEND_DIR/venv"

            if [ ! -d "$VENV_DIR" ]; then
              echo "Error: backend virtual environment not found."
              echo "Run: nix run .#init"
              exit 1
            fi

            cleanup() {
              echo ""
              echo "Stopping StudySync services..."
              kill "$BACKEND_PID" "$FRONTEND_PID" 2>/dev/null || true
              wait "$BACKEND_PID" "$FRONTEND_PID" 2>/dev/null || true
            }

            trap cleanup EXIT INT TERM

            echo "Starting Django backend..."
            (
              cd "$BACKEND_DIR"
              . "$VENV_DIR/bin/activate"
              python manage.py runserver
            ) &
            BACKEND_PID=$!

            echo "Starting React frontend..."
            (
              cd "$FRONTEND_DIR"
              npm run dev
            ) &
            FRONTEND_PID=$!

            wait "$BACKEND_PID" "$FRONTEND_PID"
          '';
        };

        testsScript = pkgs.writeShellApplication {
          name = "studysync-tests";
          runtimeInputs = runtimeInputs;
          text = ''
            set -euo pipefail

            ROOT="$(pwd)"
            BACKEND_DIR="$ROOT/backend"
            FRONTEND_DIR="$ROOT/frontend"
            VENV_DIR="$BACKEND_DIR/venv"

            if [ ! -d "$VENV_DIR" ]; then
              echo "Error: backend virtual environment not found."
              echo "Run: nix run .#init"
              exit 1
            fi

            echo "Running backend tests..."
            cd "$BACKEND_DIR"
            . "$VENV_DIR/bin/activate"
            coverage run manage.py test
            coverage report -m

            echo "Running frontend tests..."
            cd "$FRONTEND_DIR"
            npm run test
            npm run coverage

            echo "All tests and coverage commands completed."
          '';
        };

        seedScript = pkgs.writeShellApplication {
          name = "studysync-seed";
          runtimeInputs = runtimeInputs;
          text = ''
            set -euo pipefail

            ROOT="$(pwd)"
            BACKEND_DIR="$ROOT/backend"
            VENV_DIR="$BACKEND_DIR/venv"

            if [ ! -d "$VENV_DIR" ]; then
              echo "Error: backend virtual environment not found."
              echo "Run: nix run .#init"
              exit 1
            fi

            cd "$BACKEND_DIR"
            . "$VENV_DIR/bin/activate"
            python manage.py seed
          '';
        };

        unseedScript = pkgs.writeShellApplication {
          name = "studysync-unseed";
          runtimeInputs = runtimeInputs;
          text = ''
            set -euo pipefail

            ROOT="$(pwd)"
            BACKEND_DIR="$ROOT/backend"
            VENV_DIR="$BACKEND_DIR/venv"

            if [ ! -d "$VENV_DIR" ]; then
              echo "Error: backend virtual environment not found."
              echo "Run: nix run .#init"
              exit 1
            fi

            cd "$BACKEND_DIR"
            . "$VENV_DIR/bin/activate"
            python manage.py unseed
          '';
        };
      in
      {
        apps = {
          init = {
            type = "app";
            program = "${initScript}/bin/studysync-init";
          };

          run = {
            type = "app";
            program = "${runScript}/bin/studysync-run";
          };

          tests = {
            type = "app";
            program = "${testsScript}/bin/studysync-tests";
          };

          seed = {
            type = "app";
            program = "${seedScript}/bin/studysync-seed";
          };

          unseed = {
            type = "app";
            program = "${unseedScript}/bin/studysync-unseed";
          };
        };

        devShells.default = pkgs.mkShell {
          packages = runtimeInputs;
          shellHook = ''
            echo "StudySync dev shell"
            echo "Available commands:"
            echo "  nix run .#init"
            echo "  nix run .#run"
            echo "  nix run .#tests"
            echo "  nix run .#seed"
            echo "  nix run .#unseed"
          '';
        };
      });
}