'use client';

import React, { useRef, useMemo, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { extend, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { shaderMaterial } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';

// Shader Material para a Orb - HIPNOTIZANTE E NÍTIDA
const OrbSimpleMaterial = shaderMaterial(
  // Uniforms
  {
    uTime: 0,
  },
  
  // Vertex Shader - Simples
  /* glsl */`
    varying vec2 vUv;
    varying vec3 vPosition;
    varying vec3 vNormal;
    
    void main() {
      vUv = uv;
      vPosition = position;
      vNormal = normal;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  
  // Fragment Shader - HIPNOTIZANTE E CRISTALINO
  /* glsl */`
    precision highp float;
    
    varying vec2 vUv;
    varying vec3 vPosition;
    varying vec3 vNormal;
    
    uniform float uTime;
    
    // Função de ruído 3D otimizada e nítida
    vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
    vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
    
    float snoise(vec3 v) {
      const vec2 C = vec2(1.0/6.0, 1.0/3.0);
      const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
      
      vec3 i  = floor(v + dot(v, C.yyy));
      vec3 x0 = v - i + dot(i, C.xxx);
      
      vec3 g = step(x0.yzx, x0.xyz);
      vec3 l = 1.0 - g;
      vec3 i1 = min(g.xyz, l.zxy);
      vec3 i2 = max(g.xyz, l.zxy);
      
      vec3 x1 = x0 - i1 + C.xxx;
      vec3 x2 = x0 - i2 + C.yyy;
      vec3 x3 = x0 - D.yyy;
      
      i = mod289(i);
      vec4 p = permute(permute(permute(
                 i.z + vec4(0.0, i1.z, i2.z, 1.0))
               + i.y + vec4(0.0, i1.y, i2.y, 1.0))
               + i.x + vec4(0.0, i1.x, i2.x, 1.0));
      
      float n_ = 0.142857142857;
      vec3 ns = n_ * D.wyz - D.xzx;
      
      vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
      
      vec4 x_ = floor(j * ns.z);
      vec4 y_ = floor(j - 7.0 * x_);
      
      vec4 x = x_ *ns.x + ns.yyyy;
      vec4 y = y_ *ns.x + ns.yyyy;
      vec4 h = 1.0 - abs(x) - abs(y);
      
      vec4 b0 = vec4(x.xy, y.xy);
      vec4 b1 = vec4(x.zw, y.zw);
      
      vec4 s0 = floor(b0)*2.0 + 1.0;
      vec4 s1 = floor(b1)*2.0 + 1.0;
      vec4 sh = -step(h, vec4(0.0));
      
      vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
      vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
      
      vec3 p0 = vec3(a0.xy, h.x);
      vec3 p1 = vec3(a0.zw, h.y);
      vec3 p2 = vec3(a1.xy, h.z);
      vec3 p3 = vec3(a1.zw, h.w);
      
      vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
      p0 *= norm.x;
      p1 *= norm.y;
      p2 *= norm.z;
      p3 *= norm.w;
      
      vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
      m = m * m;
      return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
    }
    
    // FBM otimizado para ondulações nítidas
    float fbm(vec3 p) {
        float value = 0.0;
        float amplitude = 0.5;
        float frequency = 1.0;
        
        for(int i = 0; i < 3; i++) {
            value += amplitude * snoise(p * frequency);
            frequency *= 2.0;
            amplitude *= 0.5;
        }
        return value;
    }
    
    void main() {
        vec2 st = vUv;
        float time = uTime * 0.5; // Velocidade ULTRA-hipnotizante
        
        vec2 sphereUV = (st - 0.5) * 2.0;
        float r = length(sphereUV);
        
        // === ONDULAÇÕES HIPNOTIZANTES CIENTÍFICAS DE GOTA D'ÁGUA VIVA ===
        // Ondulações harmônicas múltiplas para hipnotização extrema
        float hypnoWave1 = sin(sphereUV.x * 1.618 + time * 0.382) * smoothstep(0.15, 0.85, r) * 0.008; // Proporção áurea
        float hypnoWave2 = sin(sphereUV.y * 1.414 + time * 0.618) * smoothstep(0.12, 0.88, r) * 0.007; // Raiz de 2
        float hypnoWave3 = sin((sphereUV.x + sphereUV.y) * 1.732 + time * 0.707) * smoothstep(0.18, 0.82, r) * 0.006; // Raiz de 3
        float hypnoWave4 = cos((sphereUV.x - sphereUV.y) * 2.236 + time * 0.447) * smoothstep(0.20, 0.80, r) * 0.005; // Proporção áurea²
        
        // Ondulações de Fibonacci para hipnotização natural
        float fiboWave1 = sin(sphereUV.x * 2.618 + time * 0.236) * smoothstep(0.25, 0.75, r) * 0.004;
        float fiboWave2 = cos(sphereUV.y * 1.272 + time * 0.786) * smoothstep(0.30, 0.70, r) * 0.003;
        
        // Tensão superficial com múltiplas harmonias
        float surfaceTension = (cos(r * 2.618 + time * 0.618) + sin(r * 1.618 + time * 0.382)) * smoothstep(0.65, 0.95, r) * 0.004;
        
        // Ondulações concêntricas hipnotizantes com sequência de Fibonacci
        float ripple1 = sin(r * 3.141 + time * 0.618) * (1.0 - r * 0.2) * pow(1.0 - r, 0.5) * 0.006; // π e φ
        float ripple2 = sin(r * 2.718 - time * 0.382) * (1.0 - r * 0.15) * pow(1.0 - r, 0.3) * 0.005; // e e φ⁻¹
        float ripple3 = cos(r * 1.618 + time * 0.236) * (1.0 - r * 0.1) * pow(1.0 - r, 0.7) * 0.004; // φ e Fibonacci
        
        // Ondulações de ressonância hipnotizante
        float resonance1 = sin(r * 7.389 + time * 0.135) * smoothstep(0.4, 0.9, r) * pow(r, 1.618) * 0.003;
        float resonance2 = cos(r * 5.385 - time * 0.185) * smoothstep(0.3, 0.8, r) * pow(r, 1.414) * 0.002;
        
        // Menisco científico com curvatura perfeita (sempre fechado)
        float meniscus = (sin(r * 4.669 + time * 0.314) + cos(r * 6.283 - time * 0.159)) * 
                        smoothstep(0.80, 0.98, r) * pow(r, 3.0) * (1.0 - pow(r, 8.0)) * 0.003;
        
        // Correntes fluidas hipnotizantes com matemática sagrada
        float angle = atan(sphereUV.y, sphereUV.x);
        float sacredFlow1 = sin(angle * 1.618 + r * 2.618 + time * 0.382) * (1.0 - r * 0.25) * pow(1.0 - r, 0.618) * 0.007;
        float sacredFlow2 = cos(angle * 1.272 - r * 1.618 - time * 0.236) * (1.0 - r * 0.20) * pow(1.0 - r, 0.382) * 0.006;
        float sacredFlow3 = sin(angle * 0.786 + r * 1.272 + time * 0.618) * (1.0 - r * 0.15) * pow(1.0 - r, 0.236) * 0.005;
        
        // Vórtice hipnotizante em espiral dourada
        float goldenVortex1 = sin(angle * 2.618 + r * r * 1.618 + time * 0.318) * pow(1.0 - r, 1.618) * pow(r, 0.618) * 0.006;
        float goldenVortex2 = cos(angle * 1.618 - r * r * 2.618 - time * 0.481) * pow(1.0 - r, 2.618) * pow(r, 0.382) * 0.005;
        
        // Micro-correntes com padrões fractais
        float fractalFlow1 = sin(angle * 3.141 + r * 6.283 + time * 0.159) * pow(r, 1.272) * (1.0 - pow(r, 1.618)) * 0.004;
        float fractalFlow2 = cos(angle * 2.718 - r * 5.385 - time * 0.271) * pow(r, 1.414) * (1.0 - pow(r, 2.236)) * 0.003;
        
        // Ondulações de interferência ULTRA-HIPNOTIZANTES
        float interference1 = sin(sphereUV.x * 11.0 + time * 2.8) * cos(sphereUV.y * 8.0 + time * 2.2) * 0.012;
        float interference2 = cos(sphereUV.x * 13.0 - time * 3.4) * sin(sphereUV.y * 9.0 - time * 2.6) * 0.010;
        float interference3 = sin(sphereUV.x * 15.0 + time * 4.0) * cos(sphereUV.y * 12.0 + time * 3.2) * 0.008;
        float interference4 = cos(sphereUV.x * 17.0 - time * 4.6) * sin(sphereUV.y * 14.0 - time * 3.8) * 0.006;
        
        // Ondulações de batimento hipnotizantes
        float beat1 = sin(sphereUV.x * 20.0 + time * 5.0) * sin(sphereUV.x * 20.5 + time * 5.1) * 0.009;
        float beat2 = cos(sphereUV.y * 18.0 + time * 4.5) * cos(sphereUV.y * 18.3 + time * 4.6) * 0.007;
        
        // Ondulações fractais hipnotizantes
        float fractal1 = sin(sphereUV.x * 16.0 + sin(sphereUV.y * 12.0 + time * 3.0) + time * 4.2) * 0.011;
        float fractal2 = cos(sphereUV.y * 14.0 + cos(sphereUV.x * 10.0 + time * 2.5) + time * 3.8) * 0.009;
        
        // === ONDULAÇÕES DE DNA DUPLA HÉLICE HIPNOTIZANTES ===
        float helixAngle1 = angle + time * 4.0;
        float helixAngle2 = angle + time * 4.0 + 3.14159;
        float dnaHelix1 = sin(helixAngle1 * 3.0 + r * 15.0) * cos(r * 12.0 + time * 3.5) * 0.013;
        float dnaHelix2 = sin(helixAngle2 * 3.0 + r * 15.0) * cos(r * 12.0 + time * 3.5) * 0.013;
        float dnaConnection = sin(r * 20.0 + time * 5.0) * 0.008;
        
        // === ONDULAÇÕES DE MANDALA HIPNOTIZANTES ===
        float mandala1 = sin(angle * 8.0 + r * 16.0 + time * 4.5) * cos(angle * 6.0 - time * 3.8) * 0.012;
        float mandala2 = cos(angle * 12.0 - r * 14.0 + time * 5.2) * sin(angle * 9.0 + time * 4.1) * 0.010;
        float mandala3 = sin(angle * 16.0 + r * 18.0 - time * 6.0) * cos(angle * 4.0 + time * 3.2) * 0.008;
        
        // === ONDULAÇÕES DE VÓRTICE HIPNOTIZANTES ===
        float vortexHypnotic1 = sin(angle * 20.0 + r * r * 25.0 + time * 7.0) * 0.014;
        float vortexHypnotic2 = cos(angle * 15.0 - r * r * 20.0 - time * 6.5) * 0.012;
        float vortexHypnotic3 = sin(angle * 25.0 + r * r * 30.0 + time * 8.0) * 0.010;
        
        // === ONDULAÇÕES DE FLOR DA VIDA HIPNOTIZANTES ===
        float flowerLife1 = sin(angle * 6.0 + time * 3.0) * sin(r * 18.0 + time * 4.0) * 0.009;
        float flowerLife2 = cos(angle * 12.0 - time * 3.5) * cos(r * 24.0 - time * 4.5) * 0.007;
        float flowerLife3 = sin(angle * 18.0 + time * 4.0) * sin(r * 30.0 + time * 5.0) * 0.005;
        
        // Combinar TODAS as ondulações científicas hipnotizantes (sempre fechada)
        float edgeDeformation = (hypnoWave1 + hypnoWave2 + hypnoWave3 + hypnoWave4 + fiboWave1 + fiboWave2 + surfaceTension +
                                ripple1 + ripple2 + ripple3 + resonance1 + resonance2 + meniscus +
                                sacredFlow1 + sacredFlow2 + sacredFlow3 + goldenVortex1 + goldenVortex2 + fractalFlow1 + fractalFlow2 +
                                interference1 + interference2 + interference3 + interference4 +
                                beat1 + beat2 + fractal1 + fractal2 +
                                dnaHelix1 + dnaHelix2 + dnaConnection +
                                mandala1 + mandala2 + mandala3 +
                                vortexHypnotic1 + vortexHypnotic2 + vortexHypnotic3 +
                                flowerLife1 + flowerLife2 + flowerLife3) * smoothstep(0.05, 0.88, r) * (1.0 - pow(r, 12.0));
        
        // Aplicar deformação garantindo que a orb permaneça sempre fechada
        float deformedR = r + edgeDeformation;
        
        // Garantir que a orb nunca se abra (limitação científica rigorosa)
        deformedR = min(deformedR, 0.98); // Limite máximo absoluto
        
        if(deformedR > 0.99) discard; // Segurança adicional
        
        float z = sqrt(max(0.0, 1.0 - deformedR * deformedR));
        vec3 spherePos = vec3(sphereUV, z); 
        
        // === ONDULAÇÕES VOLUMÉTRICAS HIPNOTIZANTES ===
        // Movimento orgânico do ruído
        vec3 noiseOffset1 = vec3(
            sin(time * 0.4) * 0.3,
            cos(time * 0.5) * 0.3,
            sin(time * 0.3) * 0.3
        );
        
        vec3 noiseOffset2 = vec3(
            cos(time * 0.6) * 0.25,
            sin(time * 0.7) * 0.25,
            cos(time * 0.4) * 0.25
        );
        
        // Múltiplas camadas de profundidade
        float depth1 = z + sin(time * 1.2 + r * 6.0) * 0.2;
        float depth2 = z * 0.8 + cos(time * 1.5 + r * 4.0) * 0.15;
        float depth3 = z * 0.6 + sin(time * 1.8 + r * 8.0) * 0.18;
        float depth4 = z * 0.4 + cos(time * 2.1 + r * 5.0) * 0.12;
        
        // Ruído volumétrico ULTRA-NÍTIDO e hipnotizante
        float noise1 = fbm(spherePos * 4.0 + noiseOffset1 + vec3(sphereUV.x * 3.5, depth1 * 2.0, sphereUV.y * 3.2));
        float noise2 = fbm(spherePos * 5.2 + noiseOffset2 + vec3(sphereUV.y * 2.8, depth2 * 2.5, sphereUV.x * 3.8));
        float noise3 = fbm(spherePos * 4.6 + noiseOffset1 * 0.9 + vec3(depth3 * 2.2, sphereUV.x * 3.0, sphereUV.y * 3.5));
        float noise4 = fbm(spherePos * 5.8 + noiseOffset2 * 1.1 + vec3(depth4 * 2.8, sphereUV.y * 3.3, sphereUV.x * 2.9));
        float noise5 = fbm(spherePos * 6.2 + noiseOffset1 * 1.3 + vec3(sphereUV.x * 4.0, depth1 * 3.0, sphereUV.y * 2.7));
        float noise6 = fbm(spherePos * 4.8 + noiseOffset2 * 0.6 + vec3(sphereUV.y * 3.7, depth2 * 2.3, sphereUV.x * 4.2));
        
        // Ruído de bordas ULTRA-DEFINIDO
        float edgeNoise = fbm(spherePos * 6.5 + vec3(edgeDeformation * 18.0, time * 1.2, r * 5.5));
        
        // Ruído de alta frequência para nitidez cristalina
        float highFreqNoise1 = fbm(spherePos * 8.0 + vec3(time * 2.0, edgeDeformation * 25.0, r * 7.0));
        float highFreqNoise2 = fbm(spherePos * 10.0 + vec3(time * 1.5, edgeDeformation * 30.0, r * 9.0));
        
        // Normalização ULTRA-CRISTALINA e hipnotizante
        noise1 = smoothstep(-0.3, 0.9, noise1 + edgeNoise * 0.6 + highFreqNoise1 * 0.3);
        noise2 = smoothstep(-0.2, 1.0, noise2 + edgeNoise * 0.55 + highFreqNoise2 * 0.25);
        noise3 = smoothstep(-0.4, 0.8, noise3 + edgeNoise * 0.7 + highFreqNoise1 * 0.35);
        noise4 = smoothstep(-0.1, 1.1, noise4 + edgeNoise * 0.5 + highFreqNoise2 * 0.4);
        noise5 = smoothstep(-0.3, 0.9, noise5 + edgeNoise * 0.65 + highFreqNoise1 * 0.2);
        noise6 = smoothstep(-0.2, 1.0, noise6 + edgeNoise * 0.6 + highFreqNoise2 * 0.3);
        
        // Aplicar contraste ULTRA-HIPNOTIZANTE para nitidez absoluta
        noise1 = pow(noise1, 0.6);
        noise2 = pow(noise2, 0.5);
        noise3 = pow(noise3, 0.7);
        noise4 = pow(noise4, 0.4);
        noise5 = pow(noise5, 0.65);
        noise6 = pow(noise6, 0.55);
        
        // Aplicar sharpening ULTRA-HIPNOTIZANTE para gota d'água cristalina
        float sharpening = 1.8; // Nitidez extrema
        noise1 = clamp(noise1 * sharpening - (sharpening - 1.0) * 0.5, 0.0, 1.0);
        noise2 = clamp(noise2 * sharpening - (sharpening - 1.0) * 0.5, 0.0, 1.0);
        noise3 = clamp(noise3 * sharpening - (sharpening - 1.0) * 0.5, 0.0, 1.0);
        noise4 = clamp(noise4 * sharpening - (sharpening - 1.0) * 0.5, 0.0, 1.0);
        noise5 = clamp(noise5 * sharpening - (sharpening - 1.0) * 0.5, 0.0, 1.0);
        noise6 = clamp(noise6 * sharpening - (sharpening - 1.0) * 0.5, 0.0, 1.0);
        
        // Sharpening adicional para definição cristalina
        float ultraSharp = 1.4;
        noise1 = pow(noise1, 1.0/ultraSharp);
        noise2 = pow(noise2, 1.0/ultraSharp);
        noise3 = pow(noise3, 1.0/ultraSharp);
        
        // === PALETA DE CORES HIPNOTIZANTE ===
        // Base acinzentada como no modelo
        vec3 baseGray = vec3(0.85, 0.87, 0.90);
        vec3 darkGray = vec3(0.65, 0.68, 0.72);
        
        // Cores sutis de liquid glass cristalino
        vec3 color1 = mix(baseGray, vec3(0.82, 0.84, 0.86), noise1);
        vec3 color2 = mix(vec3(0.91, 0.89, 0.93), vec3(0.83, 0.81, 0.87), noise2);
        vec3 color3 = mix(vec3(0.93, 0.91, 0.89), vec3(0.85, 0.83, 0.81), noise3);
        vec3 color4 = mix(vec3(0.90, 0.93, 0.91), vec3(0.82, 0.85, 0.83), noise4);
        vec3 color5 = mix(vec3(0.92, 0.90, 0.94), vec3(0.84, 0.82, 0.88), noise5);
        vec3 color6 = mix(vec3(0.94, 0.92, 0.90), vec3(0.86, 0.84, 0.82), noise6);
        
        // Cores de profundidade liquid glass
        vec3 depthColor1 = mix(vec3(0.90, 0.92, 0.95), vec3(0.80, 0.84, 0.88), depth1);
        vec3 depthColor2 = mix(vec3(0.92, 0.90, 0.94), vec3(0.82, 0.80, 0.86), depth2);
        
        // Pesos dinâmicos ULTRA-HIPNOTIZANTES
        float weight1 = sin(time * 2.4 + noise1 * 6.0) * 0.4 + 0.6;
        float weight2 = cos(time * 1.8 + noise2 * 5.5) * 0.4 + 0.6;
        float weight3 = sin(time * 3.0 + noise3 * 6.4) * 0.4 + 0.6;
        float weight4 = cos(time * 2.2 + noise4 * 5.8) * 0.4 + 0.6;
        float weight5 = sin(time * 2.8 + noise5 * 6.2) * 0.4 + 0.6;
        float weight6 = cos(time * 3.4 + noise6 * 5.9) * 0.4 + 0.6;
        
        // Peso para bordas
        float edgeWeight = smoothstep(0.6, 1.0, deformedR) * (sin(time * 2.0) * 0.4 + 0.6);
        
        // Mistura final sutil de liquid glass
        vec3 finalWispColor = color1 * noise1 * weight1 * 0.08 + 
                             color2 * noise2 * weight2 * 0.08 + 
                             color3 * noise3 * weight3 * 0.07 +
                             color4 * noise4 * weight4 * 0.07 +
                             color5 * noise5 * weight5 * 0.06 +
                             color6 * noise6 * weight6 * 0.06 +
                             depthColor1 * 0.05 +
                             depthColor2 * 0.04;
        
        // Base de vidro líquido ultra-transparente
        vec3 baseGlass = vec3(0.88, 0.90, 0.92) * 0.04;
        
        // Intensidade de vidro líquido hipnotizante
        float wispIntensity = (noise1 + noise2 + noise3 + noise4 + noise5 + noise6) / 6.0;
        wispIntensity = smoothstep(0.02, 0.98, wispIntensity) * 8.5; // Intensidade para liquid glass
        
        // Adicionar variação sutil de profundidade liquid glass
        wispIntensity += abs(z - 0.5) * 0.3;
        wispIntensity += edgeDeformation * 2.2; // Definição suave nas bordas
        wispIntensity += (1.0 - z) * 0.25;
        
        // Pulsação hipnotizante com frequências sagradas
        float goldenPulse1 = sin(time * 0.618) * 0.12 + 0.88; // Proporção áurea
        float goldenPulse2 = cos(time * 0.382) * 0.08 + 0.92; // Inverso da proporção áurea
        float fiboPulse1 = sin(time * 0.236) * 0.06 + 0.94;   // Fibonacci
        float fiboPulse2 = cos(time * 0.786) * 0.04 + 0.96;   // Fibonacci inverso
        float sacredBreath = sin(time * 0.314) * 0.03 + 0.97; // π/10 respiração sagrada
        float cosmicPulse = cos(time * 0.159) * 0.02 + 0.98;  // π/20 pulsação cósmica
        wispIntensity *= goldenPulse1 * goldenPulse2 * fiboPulse1 * fiboPulse2 * sacredBreath * cosmicPulse;
        
        // Composição final
        vec3 finalColor = baseGlass + finalWispColor * wispIntensity;
        
        // === EFEITOS HIPNOTIZANTES ===
        // Fresnel liquid glass ultra-sutil
        vec3 viewDir = normalize(-vPosition);
        float fresnel = 1.0 - max(0.0, dot(vNormal, viewDir));
        fresnel = pow(fresnel, 2.0);
        finalColor += vec3(0.92, 0.94, 0.96) * fresnel * 0.03;
        
        // Brilho central liquid glass ultra-sutil
        float centerGlow = smoothstep(0.8, 0.0, deformedR);
        float centerPulse = sin(time * 2.2) * 0.008 + 0.015;
        finalColor += vec3(0.94, 0.96, 0.98) * centerGlow * centerPulse;
        
        // === EFEITOS SUPREMOS DE LIQUID GLASS HIPNOTIZANTE ===
        // Iridescência liquid glass ultra-sutil
        float liquidIrid1 = sin(angle * 1.618 + time * 0.618) * cos(r * 2.618 + time * 0.382) * 0.08;
        float liquidIrid2 = cos(angle * 1.272 - time * 0.236) * sin(r * 1.618 - time * 0.618) * 0.06;
        float liquidIrid3 = sin(angle * 2.236 + time * 0.786) * cos(r * 3.141 + time * 0.314) * 0.04;
        
        // Cores liquid glass cristalinas
        vec3 liquidColor1 = vec3(0.96 + liquidIrid1 * 0.04, 0.94 + liquidIrid1 * 0.06, 0.92 + liquidIrid1 * 0.08);
        vec3 liquidColor2 = vec3(0.94 + liquidIrid2 * 0.06, 0.96 + liquidIrid2 * 0.04, 0.93 + liquidIrid2 * 0.07);
        vec3 liquidColor3 = vec3(0.95 + liquidIrid3 * 0.05, 0.93 + liquidIrid3 * 0.07, 0.96 + liquidIrid3 * 0.04);
        
        // Mistura liquid glass hipnotizante
        float liquidWeight = smoothstep(0.2, 0.8, r) * (sin(time * 0.618) * 0.15 + 0.85);
        finalColor = mix(finalColor, (liquidColor1 + liquidColor2 + liquidColor3) / 3.0, liquidWeight * 0.12);
        
        // === REFRAÇÃO LIQUID GLASS AVANÇADA ===
        // Simulação de refração interna como vidro real
        float refractIndex = 1.52; // Índice de refração do vidro
        vec3 refractDir = refract(viewDir, vNormal, 1.0/refractIndex);
        float refractIntensity = length(refractDir) * 0.3;
        
        // Efeito de refração hipnotizante
        float refractWave1 = sin(refractIntensity * 8.0 + time * 0.382) * 0.05;
        float refractWave2 = cos(refractIntensity * 6.0 - time * 0.618) * 0.04;
        
        finalColor += vec3(0.97, 0.98, 0.99) * (refractWave1 + refractWave2) * fresnel;
        
        // === DISPERSÃO CROMÁTICA LIQUID GLASS ===
        // Separação espectral como prisma de vidro
        float dispersionR = sin(r * 12.0 + time * 0.314) * 0.02 + 0.98;
        float dispersionG = sin(r * 12.0 + time * 0.314 + 2.094) * 0.015 + 0.985; // 120° offset
        float dispersionB = sin(r * 12.0 + time * 0.314 + 4.188) * 0.01 + 0.99;   // 240° offset
        
        finalColor.r *= dispersionR;
        finalColor.g *= dispersionG;
        finalColor.b *= dispersionB;
        
        // === ONDAS DE DENSIDADE LIQUID GLASS ===
        // Variações de densidade como vidro fundido
        float density1 = sin(spherePos.x * 3.141 + time * 0.236) * cos(spherePos.y * 2.718 + time * 0.382) * 0.03;
        float density2 = cos(spherePos.z * 1.618 - time * 0.618) * sin(spherePos.x * 2.236 - time * 0.786) * 0.025;
        float density3 = sin(spherePos.y * 1.414 + time * 0.707) * cos(spherePos.z * 1.732 + time * 0.866) * 0.02;
        
        // Aplicar variações de densidade
        vec3 densityEffect = vec3(0.98, 0.985, 0.99) * (density1 + density2 + density3);
        finalColor += densityEffect * wispIntensity * 0.15;

        // Efeito holográfico
        float holo1 = sin(sphereUV.x * 20.0 + time * 8.0) * 0.08;
        float holo2 = cos(sphereUV.y * 18.0 - time * 7.5) * 0.06;
        float holo3 = sin((sphereUV.x + sphereUV.y) * 15.0 + time * 9.0) * 0.04;
        
        vec3 holoColor = vec3(0.88, 0.90, 0.92) + vec3(holo1, holo2, holo3);
        finalColor += holoColor * (noise1 + noise2) * 0.15;
        
        // Reflexos internos ULTRA-hipnotizantes
        float internalReflection1 = noise1 * noise2 * 0.25;
        float internalReflection2 = noise3 * noise4 * 0.22;
        float internalReflection3 = noise5 * noise6 * 0.20;
        
        finalColor += vec3(0.86, 0.88, 0.91) * internalReflection1;
        finalColor += vec3(0.88, 0.86, 0.90) * internalReflection2;
        finalColor += vec3(0.90, 0.88, 0.86) * internalReflection3;
        
        // Brilho nas bordas
        float edgeGlow = smoothstep(0.85, 1.0, deformedR) * abs(edgeDeformation) * 2.0;
        finalColor += vec3(0.84, 0.87, 0.90) * edgeGlow * 0.3;
        
        // === EFEITOS DE PRISMA E DISPERSÃO CROMÁTICA HIPNOTIZANTES ===
        // Simulação de dispersão de luz como um prisma
        vec3 prismOffset1 = vec3(sin(time * 5.0), cos(time * 4.5), sin(time * 6.0)) * 0.02;
        vec3 prismOffset2 = vec3(cos(time * 6.5), sin(time * 5.5), cos(time * 7.0)) * 0.015;
        vec3 prismOffset3 = vec3(sin(time * 7.5), cos(time * 6.0), sin(time * 8.0)) * 0.01;
        
        // Efeitos de refração hipnotizantes
        float refraction1 = fbm(spherePos + prismOffset1) * 0.3;
        float refraction2 = fbm(spherePos + prismOffset2) * 0.25;
        float refraction3 = fbm(spherePos + prismOffset3) * 0.2;
        
        // Dispersão cromática simulada
        vec3 dispersion = vec3(
            refraction1 * 0.1 + 0.9,
            refraction2 * 0.08 + 0.92,
            refraction3 * 0.06 + 0.94
        );
        
        // Aplicar dispersão à cor final
        finalColor *= dispersion;
        
        // === CÁUSTICA LIQUID GLASS HIPNOTIZANTE ===
        // Padrões de cáustica como luz através de vidro líquido
        float causticLiquid1 = sin(spherePos.x * 4.669 + time * 0.159) * sin(spherePos.y * 3.141 + time * 0.314) * 0.08;
        float causticLiquid2 = cos(spherePos.z * 5.385 + time * 0.271) * cos(spherePos.x * 2.718 + time * 0.135) * 0.06;
        float causticLiquid3 = sin(spherePos.y * 6.283 + time * 0.628) * cos(spherePos.z * 1.618 + time * 0.618) * 0.04;
        float causticLiquid4 = cos(spherePos.x * 7.389 - time * 0.739) * sin(spherePos.y * 4.669 - time * 0.466) * 0.03;
        
        // Pulsação cáustica liquid glass
        float causticPulseLiquid1 = sin(time * 0.382) * 0.2 + 0.8;
        float causticPulseLiquid2 = cos(time * 0.236) * 0.15 + 0.85;
        float causticPulseLiquid3 = sin(time * 0.618) * 0.1 + 0.9;
        
        // Aplicar cáustica liquid glass
        vec3 causticColorLiquid = vec3(0.97, 0.98, 0.99) * (causticLiquid1 + causticLiquid2 + causticLiquid3 + causticLiquid4);
        finalColor += causticColorLiquid * z * 0.4 * causticPulseLiquid1 * causticPulseLiquid2 * causticPulseLiquid3;
        
        // === MICRO-REFLEXÕES INTERNAS LIQUID GLASS ===
        // Reflexões internas múltiplas como vidro real
        float internalReflect1 = noise1 * noise2 * pow(1.0 - r, 0.618) * 0.15;
        float internalReflect2 = noise3 * noise4 * pow(1.0 - r, 0.382) * 0.12;
        float internalReflect3 = noise5 * noise6 * pow(1.0 - r, 0.236) * 0.10;
        
        // Cores das micro-reflexões
        finalColor += vec3(0.96, 0.97, 0.98) * internalReflect1;
        finalColor += vec3(0.97, 0.96, 0.99) * internalReflect2;
        finalColor += vec3(0.98, 0.99, 0.96) * internalReflect3;
        
        // === EFEITO DE PROFUNDIDADE LIQUID GLASS ===
        // Gradiente de profundidade para efeito 3D hipnotizante
        float depthGradient = smoothstep(0.0, 1.0, z) * smoothstep(0.0, 0.8, 1.0 - r);
        vec3 depthColor = vec3(0.94, 0.96, 0.98) * depthGradient * 0.08;
        finalColor += depthColor;

        // Efeito de cáustica ULTRA-HIPNOTIZANTE
        float caustic1 = sin(spherePos.x * 15.0 + time * 6.0) * sin(spherePos.y * 12.0 + time * 5.0) * 0.025;
        float caustic2 = cos(spherePos.z * 18.0 + time * 5.6) * cos(spherePos.x * 9.0 + time * 6.4) * 0.022;
        float caustic3 = sin(spherePos.y * 21.0 + time * 7.0) * cos(spherePos.z * 14.0 + time * 4.4) * 0.020;
        float caustic4 = cos(spherePos.x * 24.0 - time * 8.0) * sin(spherePos.y * 16.0 - time * 6.8) * 0.018;
        
        // Cáustica pulsante ULTRA-hipnotizante
        float causticPulse1 = sin(time * 8.0) * 0.4 + 0.6;
        float causticPulse2 = cos(time * 6.5) * 0.3 + 0.7;
        float causticPulse3 = sin(time * 9.5) * 0.25 + 0.75;
        
        finalColor += vec3(0.82, 0.85, 0.88) * (caustic1 + caustic2 + caustic3 + caustic4) * z * 0.8 * causticPulse1 * causticPulse2 * causticPulse3;
        
        finalColor = clamp(finalColor, 0.0, 1.0);

        // === ALPHA LIQUID GLASS TRANSPARENTE ===
        float baseAlpha = (1.0 - smoothstep(0.85, 1.0, deformedR)) * 0.15;
        float wispAlpha = wispIntensity * 0.08;
        float fresnelAlpha = fresnel * 0.12;
        float depthAlpha = (1.0 - z) * 0.06;
        float edgeAlpha = abs(edgeDeformation) * 0.4;
        
        // Pulsação suave do alpha
        float alphaPulse = sin(time * 1.8) * 0.05 + 0.95;
        
        float finalAlpha = (baseAlpha + wispAlpha + fresnelAlpha + depthAlpha + edgeAlpha) * alphaPulse;
        finalAlpha = clamp(finalAlpha, 0.0, 0.35); // Muito mais transparente
        
        gl_FragColor = vec4(finalColor, finalAlpha);
    }
  `
);

extend({ OrbSimpleMaterial });

// Componente interno da Orb - OTIMIZADO PARA PERFORMANCE
const OrbMesh = () => {
  const meshRef = useRef<THREE.Mesh>(null!);
  const materialRef = useRef<THREE.ShaderMaterial>(null!);
  
  const customMaterial = useMemo(() => {
    console.log("OrbSimpleMaterial CONSTRUCTOR - Hypnotic Crystal Glass");
    const mat = new OrbSimpleMaterial();
    mat.transparent = true;
    mat.blending = THREE.NormalBlending;
    mat.side = THREE.DoubleSide;
    mat.depthWrite = false;
    return mat;
  }, []);

  // Memoizar a geometria para evitar recriação
  const geometry = useMemo(() => {
    return new THREE.SphereGeometry(0.75, 96, 96); // Reduzido de 128x128 para 96x96
  }, []);

  // Otimizar animações com useCallback
  const updateAnimations = useCallback((time: number) => {
    if (!meshRef.current) return;
    
    // === MOVIMENTO LIQUID GLASS ULTRA-HIPNOTIZANTE ===
    // Rotações hipnotizantes com proporção áurea
    const rotX = Math.sin(time * 0.618) * 0.15 + 
                 Math.cos(time * 0.382) * 0.12 + 
                 Math.sin(time * 0.236) * 0.08 +
                 Math.cos(time * 0.786) * 0.05 +
                 Math.sin(time * 1.618) * 0.03 +
                 Math.cos(time * 2.618) * 0.02;
    
    const rotY = Math.cos(time * 0.786) * 0.18 + 
                 Math.sin(time * 0.618) * 0.14 + 
                 Math.cos(time * 0.382) * 0.10 +
                 Math.sin(time * 0.236) * 0.06 +
                 Math.cos(time * 1.272) * 0.04 +
                 Math.sin(time * 2.236) * 0.02;
    
    const rotZ = Math.sin(time * 0.314) * 0.12 + 
                 Math.cos(time * 0.159) * 0.09 + 
                 Math.sin(time * 0.628) * 0.06 +
                 Math.cos(time * 0.942) * 0.04 +
                 Math.sin(time * 1.256) * 0.03;
    
    meshRef.current.rotation.x = rotX;
    meshRef.current.rotation.y = rotY;
    meshRef.current.rotation.z = rotZ;
    
    // Flutuação liquid glass hipnotizante
    const floatY = Math.sin(time * 0.618) * 0.04 + 
                   Math.cos(time * 0.382) * 0.03 + 
                   Math.sin(time * 0.236) * 0.02 +
                   Math.cos(time * 0.786) * 0.015;
    meshRef.current.position.y = floatY;
    
    // Deriva liquid glass suave
    const driftX = Math.sin(time * 0.314) * 0.025 + 
                   Math.cos(time * 0.159) * 0.018 +
                   Math.sin(time * 0.628) * 0.012;
    const driftZ = Math.cos(time * 0.471) * 0.03 + 
                   Math.sin(time * 0.942) * 0.02 +
                   Math.cos(time * 1.256) * 0.015;
    meshRef.current.position.x = driftX;
    meshRef.current.position.z = driftZ;
    
    // Respiração liquid glass com pulsação áurea
    const baseScale = 1.0;
    const breathe1 = Math.sin(time * 0.618) * 0.015;
    const breathe2 = Math.cos(time * 0.382) * 0.012;
    const breathe3 = Math.sin(time * 0.236) * 0.008;
    const breathe4 = Math.cos(time * 0.786) * 0.005;
    
    // Respiração complexa liquid glass
    const liquidBreath = Math.sin(time * 0.314) * Math.cos(time * 0.159) * 0.01;
    
    const scale = baseScale + breathe1 + breathe2 + breathe3 + breathe4 + liquidBreath;
    meshRef.current.scale.setScalar(scale);
    
    // Micro-movimentos liquid glass hipnotizantes
    const microX = Math.sin(time * 3.141) * 0.001;
    const microY = Math.cos(time * 2.718) * 0.001;
    const microZ = Math.sin(time * 1.618) * 0.001;
    
    meshRef.current.position.x += microX;
    meshRef.current.position.y += microY;
    meshRef.current.position.z += microZ;
  }, []);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
    
    updateAnimations(state.clock.elapsedTime);
  });

  return (
    <mesh ref={meshRef} castShadow receiveShadow>
      <primitive object={geometry} />
      <primitive object={customMaterial} ref={materialRef} attach="material" />
    </mesh>
  );
};

// Componente principal da AI Orb - OTIMIZADO PARA PERFORMANCE
const AIOrb = () => {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <Canvas
        camera={{ position: [0, 0, 3], fov: 45 }}
        gl={{ 
          antialias: true, 
          alpha: true,
          powerPreference: "high-performance",
          // Otimizações de performance
          stencil: false,
          depth: true,
          preserveDrawingBuffer: false
        }}
        dpr={[1, 1.5]} // Reduzido de [1, 2] para melhor performance
        style={{ background: 'transparent' }}
        // Otimizações do Canvas
        frameloop="always"
        performance={{ min: 0.8 }} // Reduz qualidade se performance cair
      >
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={0.5} />
        <pointLight position={[-10, -10, -10]} intensity={0.3} />
        
        <OrbMesh />
        
        <EffectComposer
          // Otimizações do EffectComposer
          multisampling={0} // Desabilita antialiasing pesado
        >
          <Bloom 
            intensity={0.3} 
            luminanceThreshold={0.2} 
            luminanceSmoothing={0.9}
            radius={0.8}
            // Otimizações do Bloom
            mipmapBlur={true} // Usa mipmaps para melhor performance
            levels={6} // Reduzido de 9 (padrão) para 6
          />
        </EffectComposer>
      </Canvas>
    </div>
  );
};

export default AIOrb; 