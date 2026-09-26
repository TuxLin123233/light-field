#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <FastLED.h>
#include <WiFiClientSecure.h>
#include "wifi_secret.h"    // 本地密钥文件（不入库，见 wifi_secret.example.h）

#define LDR_PIN 3       // 光敏模块引脚
#define NUM_LEDS 256    // 灯板 LED 数量
#define LED_PIN 8       // ⚠️ 面包板是 8，焊完 PCB 改成 5

const char* url      = "https://light-field.pages.dev/api/get?single=1";

const unsigned long interval = 120000;  // 每 2 分钟拉一次

CRGB leds[NUM_LEDS];
CRGB pendingLeds[NUM_LEDS];             // 拉取到的图先放这
volatile bool dataReady = false;        // 有新图待显示
volatile bool isLoading = true;         // 正在加载（跑动画）

// ============ 光敏 → 亮度 ============
int getBrightness() {
  int light = analogRead(LDR_PIN);
  int brightness = map(light, 4095, 500, 8, 15);
  brightness = constrain(brightness, 8, 15);
  return brightness;
}

// ============ 画面坐标 → 物理 LED 索引 ============
int xy2idx(int x, int y) {
  int ledRow = 15 - y;                    // 上下翻转
  int col = x;
  if (ledRow % 2 == 1) col = 15 - col;    // 蛇形
  return ledRow * 16 + col;
}

// ============ 加载动画：中心呼吸圆 ============
void loadingAnim() {
  static float t = 0;
  t += 0.15;
  float r = 7.5 * (0.5 - 0.5 * cos(t));   // 半径 0~7.5 呼吸

  FastLED.clear();
  for (int y = 0; y < 16; y++) {
    for (int x = 0; x < 16; x++) {
      float d = sqrt((x - 7.5) * (x - 7.5) + (y - 7.5) * (y - 7.5));
      float v = 255 * (1.0 - abs(d - r) / 1.5);
      if (v > 0) leds[xy2idx(x, y)] = CHSV(160, 255, v);
    }
  }
  FastLED.setBrightness(15);
  FastLED.show();
}

// ============ 后台任务：专门拉数据 ============
void fetchTask(void *param) {
  while (1) {
    isLoading = true;
    vTaskDelay(200 / portTICK_PERIOD_MS);   // 给主 loop 切去动画

    if (WiFi.status() == WL_CONNECTED) {
      WiFiClientSecure client;
      client.setInsecure();

      HTTPClient http;
      http.begin(client, url);
      http.setTimeout(10000);
      int code = http.GET();

      if (code == 200) {
        String payload = http.getString();
        Serial.printf("payload = %d bytes\n", payload.length());

        DynamicJsonDocument doc(8192);
        DeserializationError err = deserializeJson(doc, payload);

        if (err) {
          Serial.print("JSON error: ");
          Serial.println(err.c_str());
        } else {
          JsonArray arr = doc["pixels"];
          Serial.printf("pixels = %d\n", arr.size());

          for (int i = 0; i < NUM_LEDS && i < arr.size(); i++) {
            JsonArray rgb = arr[i];
            pendingLeds[xy2idx(i % 16, i / 16)] = CRGB(rgb[0], rgb[1], rgb[2]);
          }
          dataReady = true;
          Serial.println("Pixels updated");
        }
      } else {
        Serial.print("HTTP error: ");
        Serial.println(code);
      }
      http.end();
    }

    isLoading = false;                          // ✅ 无论成败都复位
    vTaskDelay(interval / portTICK_PERIOD_MS);  // 等 2 分钟
  }
}

// ============ setup ============
void setup() {
  Serial.begin(115200);

  FastLED.addLeds<WS2812B, LED_PIN, GRB>(leds, NUM_LEDS);   // ⚠️ GRB，不是 RGB
  FastLED.clear();
  FastLED.show();

  WiFi.begin(ssid, password);
  Serial.print("Connecting WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println();
  Serial.print("WiFi OK, IP: ");
  Serial.println(WiFi.localIP());

  // 启动后台拉取任务（32KB 栈，TLS 握手要）
  xTaskCreate(fetchTask, "fetch", 32768, NULL, 1, NULL);
}

// ============ loop ============
void loop() {
  if (dataReady) {
    ::memcpy(leds, pendingLeds, sizeof(leds));
    FastLED.setBrightness(getBrightness());
    FastLED.show();
    dataReady = false;
  } else if (isLoading) {
    loadingAnim();
    delay(40);
  } else {
    delay(100);
  }
}