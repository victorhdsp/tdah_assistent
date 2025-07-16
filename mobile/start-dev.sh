#!/bin/bash

AVD_NAME="Medium_Phone_Edited"
WIFI_IP="192.168.1.172" 
ADB_PORT=5555

USE_WIFI=false

# Lê flags do usuário
for arg in "$@"
do
    case $arg in
        --wifi)
        USE_WIFI=true
        shift
        ;;
    esac
done

echo "🚀 Iniciando ambiente de desenvolvimento..."

# Conecta via Wi-Fi, se pedido
if [ "$USE_WIFI" = true ]; then
  echo "📡 Conectando via Wi-Fi em $WIFI_IP:$ADB_PORT..."
  adb tcpip $ADB_PORT
  adb connect "$WIFI_IP:$ADB_PORT"
  adb wait-for-device
else
  echo "📱 Iniciando emulador $AVD_NAME..."
  emulator -avd "$AVD_NAME" -no-boot-anim -netdelay none -netspeed full > /dev/null 2>&1 &
  adb wait-for-device
fi

# Instala o app em segundo plano
echo "📦 Rodando app com Expo..."
npx expo run:android &

# Aguarda boot animation
echo "⏳ Aguardando fim da animação de boot..."
until adb shell getprop init.svc.bootanim | grep -q "stopped"; do
  sleep 1
done

# Aguarda serviço de settings
echo "🧠 Aguardando serviço settings..."
until adb shell service call settings 1 >/dev/null 2>&1; do
  sleep 1
done

# Desativa animações
echo "⚙️ Otimizando desempenho (sem animações)..."
adb shell settings put global window_animation_scale 0
adb shell settings put global transition_animation_scale 0
adb shell settings put global animator_duration_scale 0

echo "✅ Ambiente pronto!"
