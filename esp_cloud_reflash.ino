#include <ESP8266WiFi.h>
#include <DNSServer.h>
#include <ESP8266WebServer.h>
#include <WiFiManager.h>
#include <ESP8266mDNS.h>
#include <ESP8266HTTPClient.h>
#include <WiFiClient.h>

// Cloud Server Configuration
const char* SERVER_HOST = "biocolour-server.onrender.com";
const int   SERVER_PORT = 80; // Standard HTTP port for Render

unsigned long lastHeartbeat = 0;
const long heartbeatInterval = 10000; // 10 seconds

void setup() {
  delay(1000);
  Serial.begin(9600);
  delay(500);

  Serial.println("[ESP] Booted OK");
  Serial.println("[ESP] Connecting to WiFi...");

  WiFiManager wifiManager;
  wifiManager.setTimeout(180);

  if (!wifiManager.autoConnect("BioColour-Setup")) {
    Serial.println("[ESP] Portal timed out - restarting...");
    delay(2000);
    ESP.restart();
    return;
  }

  Serial.println("[ESP] WiFi connected!");
}

void sendHeartbeat() {
  WiFiClient client;
  HTTPClient http;
  
  // Render uses standard port 80/443, no need to specify it if using domain
  String url = "http://" + String(SERVER_HOST) + "/api/heartbeat";

  Serial.println("[ESP] Sending Heartbeat to Cloud...");
  http.begin(client, url);
  http.addHeader("Content-Type", "application/json");
  int httpCode = http.POST("{}");
  
  if (httpCode > 0) {
    Serial.println("[ESP] Heartbeat OK: " + String(httpCode));
  } else {
    Serial.println("[ESP] Heartbeat FAIL: " + http.errorToString(httpCode));
  }
  http.end();
  lastHeartbeat = millis();
}

void loop() {
  // 1. Send heartbeat every 10 seconds if idle
  if (millis() - lastHeartbeat >= heartbeatInterval) {
    sendHeartbeat();
  }

  // 2. Check for Serial Data from Arduino Uno
  if (Serial.available()) {
    String line = Serial.readStringUntil('\n');
    line.trim();

    if (line.startsWith("DATA:")) {
      String payload = line.substring(5);
      int pipeIdx = payload.indexOf('|');
      
      if (pipeIdx != -1) {
        String rgbPart = payload.substring(0, pipeIdx);
        String resultPart = payload.substring(pipeIdx + 1);
        resultPart.trim();

        int comma1 = rgbPart.indexOf(',');
        int comma2 = rgbPart.indexOf(',', comma1 + 1);

        if (comma1 != -1 && comma2 != -1) {
          int r = rgbPart.substring(0, comma1).toInt();
          int g = rgbPart.substring(comma1 + 1, comma2).toInt();
          int b = rgbPart.substring(comma2 + 1).toInt();

          String body = "{\"r\":"  + String(r)  +
                        ",\"g\":" + String(g)   +
                        ",\"b\":" + String(b)   +
                        ",\"result\":\"" + resultPart +
                        "\",\"patientId\":\"default\"}";

          WiFiClient client;
          HTTPClient http;
          String url = "http://" + String(SERVER_HOST) + "/api/reading";

          Serial.println("[ESP] POSTing data to Cloud...");
          http.begin(client, url);
          http.addHeader("Content-Type", "application/json");
          int httpCode = http.POST(body);
          
          if (httpCode == 200) {
            Serial.println("POST_OK");
            lastHeartbeat = millis();
          } else {
            Serial.println("POST_FAIL:" + String(httpCode));
          }
          http.end();
        }
      }
    }
  }
}
