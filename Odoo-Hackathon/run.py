import os
import sys
import subprocess
import time
import threading

def print_banner(msg):
    print("=" * 60)
    print(f" {msg}")
    print("=" * 60)

def run_backend(venv_bin):
    print("[RUN] Launching FastAPI backend on http://127.0.0.1:8000 ...")
    uvicorn_cmd = [venv_bin, "-m", "uvicorn", "backend.main:app", "--host", "127.0.0.1", "--port", "8000"]
    subprocess.run(uvicorn_cmd)

def run_frontend():
    print("[RUN] Launching Vite React frontend on http://localhost:3000 ...")
    npm_cmd = ["npm", "run", "dev"]
    # Change CWD to frontend directory
    subprocess.run(npm_cmd, cwd="frontend", shell=True)

def main():
    # 1. Setup Python Virtual Environment
    print_banner("1. Setting up Python Virtual Environment")
    venv_dir = os.path.join(os.getcwd(), "venv")
    is_windows = sys.platform.startswith("win")
    
    venv_bin_dir = "Scripts" if is_windows else "bin"
    pip_name = "pip.exe" if is_windows else "pip"
    python_name = "python.exe" if is_windows else "python"
    
    venv_python = os.path.join(venv_dir, venv_bin_dir, python_name)
    venv_pip = os.path.join(venv_dir, venv_bin_dir, pip_name)

    if not os.path.exists(venv_dir):
        print(f"[VENV] Creating virtual environment in {venv_dir}...")
        subprocess.run([sys.executable, "-m", "venv", "venv"])
        print("[VENV] Virtual environment created.")
    else:
        print("[VENV] Virtual environment already exists.")

    # 2. Install Python Dependencies
    print_banner("2. Installing Backend Dependencies")
    requirements_path = os.path.join("backend", "requirements.txt")
    print(f"[PIP] Installing packages from {requirements_path}...")
    subprocess.run([venv_pip, "install", "-r", requirements_path])

    # 3. Seed Database
    print_banner("3. Initializing and Seeding Relational Database")
    print("[DB] Running database seeder (seed.py)...")
    subprocess.run([venv_python, "-m", "backend.seed"])

    # 4. Install Frontend NPM Packages
    print_banner("4. Installing Frontend NPM Dependencies")
    print("[NPM] Installing frontend packages (this may take a minute)...")
    subprocess.run(["npm", "install"], cwd="frontend", shell=True)

    # 5. Start Servers Concurrently
    print_banner("5. Launching Servers")
    
    # Spawn backend thread
    backend_thread = threading.Thread(target=run_backend, args=(venv_python,))
    backend_thread.daemon = True
    backend_thread.start()

    # Wait a second for backend to spin up
    time.sleep(2)

    # Spawn frontend in main thread (so ctrl+c kills both)
    try:
      run_frontend()
    except KeyboardInterrupt:
      print("\n[STOP] Shutting down servers. Goodbye!")

if __name__ == "__main__":
    main()
