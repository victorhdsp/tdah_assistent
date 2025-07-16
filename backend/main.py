#!/usr/bin/env python3
import subprocess
import sys
import glob

def main():
    # encontra o último modelo treinado
    modelos = glob.glob("models/nlu-*.tar.gz")
    if not modelos:
        print("❌ Nenhum modelo encontrado em models/")
        sys.exit(1)
    # usa o modelo mais recente (por nome)
    modelo = sorted(modelos)[-1]
    cmd = [
        "rasa", "run",
        "--model", modelo,
        "--enable-api",
        "--cors", "*",
        "--port", "5005"
    ]
    print("🚀 Iniciando Rasa NLU com:", " ".join(cmd))
    subprocess.run(cmd)

if __name__ == "__main__":
    main()
