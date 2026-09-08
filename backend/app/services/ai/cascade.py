import time
from typing import Any, Dict, List, Optional
import httpx
from app.core.config import settings
from app.core.logging import logger

class AICascadeEngine:
    """
    4-Tier AI Cascade & Failover Engine:
      Priority 1: Google Gemini (Primary high-token model)
      Priority 2: Groq (Fast low-latency fallback)
      Priority 3: NVIDIA NIM (Secondary cloud inference)
      Priority 4: OpenRouter (Safety net free tier)
    """

    def __init__(self):
        self.gemini_key = settings.gemini_api_key
        self.groq_key = settings.groq_api_key
        self.nvidia_key = settings.nvidia_nim_api_key
        self.openrouter_key = settings.openrouter_api_key

    async def _call_gemini(self, prompt: str, system_prompt: str) -> str:
        if not self.gemini_key:
            raise ValueError("GEMINI_API_KEY not configured")
        
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key={self.gemini_key}"
        payload = {
            "contents": [
                {
                    "parts": [
                        {"text": f"SYSTEM: {system_prompt}\n\nUSER REQUEST: {prompt}" if system_prompt else prompt}
                    ]
                }
            ],
            "generationConfig": {
                "temperature": 0.3,
                "maxOutputTokens": 1024
            }
        }

        async with httpx.AsyncClient(timeout=20.0) as client:
            res = await client.post(url, json=payload)
            if res.status_code != 200:
                raise RuntimeError(f"Gemini error {res.status_code}: {res.text[:200]}")
            data = res.json()
            candidates = data.get("candidates", [])
            if not candidates:
                raise RuntimeError("Empty response from Gemini")
            return candidates[0]["content"]["parts"][0]["text"]

    async def _call_groq(self, prompt: str, system_prompt: str) -> str:
        if not self.groq_key:
            raise ValueError("GROQ_API_KEY not configured")

        url = "https://api.groq.com/openai/v1/chat/completions"
        headers = {"Authorization": f"Bearer {self.groq_key}"}
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})

        async with httpx.AsyncClient(timeout=15.0) as client:
            res = await client.post(
                url,
                headers=headers,
                json={
                    "model": "openai/gpt-oss-120b",
                    "messages": messages,
                    "temperature": 0.3,
                    "max_tokens": 1024
                }
            )
            if res.status_code != 200:
                raise RuntimeError(f"Groq error {res.status_code}: {res.text[:200]}")
            data = res.json()
            return data["choices"][0]["message"]["content"]

    async def _call_nvidia(self, prompt: str, system_prompt: str) -> str:
        if not self.nvidia_key:
            raise ValueError("NVIDIA_NIM_API_KEY not configured")

        url = "https://integrate.api.nvidia.com/v1/chat/completions"
        headers = {"Authorization": f"Bearer {self.nvidia_key}"}
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})

        async with httpx.AsyncClient(timeout=20.0) as client:
            res = await client.post(
                url,
                headers=headers,
                json={
                    "model": "meta/llama-3.2-11b-vision-instruct",
                    "messages": messages,
                    "temperature": 0.3,
                    "max_tokens": 1024
                }
            )
            if res.status_code != 200:
                raise RuntimeError(f"NVIDIA NIM error {res.status_code}: {res.text[:200]}")
            data = res.json()
            return data["choices"][0]["message"]["content"]

    async def _call_openrouter(self, prompt: str, system_prompt: str) -> str:
        if not self.openrouter_key:
            raise ValueError("OPENROUTER_API_KEY not configured")

        url = "https://openrouter.ai/api/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {self.openrouter_key}",
            "HTTP-Referer": "http://localhost:8000"
        }
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})

        async with httpx.AsyncClient(timeout=25.0) as client:
            res = await client.post(
                url,
                headers=headers,
                json={
                    "model": "nvidia/nemotron-3.5-lightning:free",
                    "messages": messages,
                    "temperature": 0.3,
                    "max_tokens": 1024
                }
            )
            if res.status_code != 200:
                raise RuntimeError(f"OpenRouter error {res.status_code}: {res.text[:200]}")
            data = res.json()
            return data["choices"][0]["message"]["content"]

    async def generate(self, prompt: str, system_prompt: str = "") -> Dict[str, Any]:
        """
        Execute request with automatic 4-tier fallback:
        Gemini -> Groq -> NVIDIA NIM -> OpenRouter
        """
        providers = [
            ("gemini", "gemini-3.6-flash", self._call_gemini),
            ("groq", "openai/gpt-oss-120b", self._call_groq),
            ("nvidia_nim", "meta/llama-3.2-11b-vision-instruct", self._call_nvidia),
            ("openrouter", "nvidia/nemotron-3.5-lightning:free", self._call_openrouter),
        ]

        fallback_history = []
        start_total = time.perf_counter()

        for provider_name, model_name, handler in providers:
            t0 = time.perf_counter()
            try:
                logger.info(f"Trying AI provider: {provider_name} ({model_name})...")
                content = await handler(prompt, system_prompt)
                duration_ms = round((time.perf_counter() - t0) * 1000)
                total_duration_ms = round((time.perf_counter() - start_total) * 1000)

                return {
                    "success": True,
                    "content": content,
                    "provider": provider_name,
                    "model": model_name,
                    "latency_ms": duration_ms,
                    "total_latency_ms": total_duration_ms,
                    "fallback_history": fallback_history
                }
            except Exception as e:
                err_msg = str(e)
                duration_ms = round((time.perf_counter() - t0) * 1000)
                logger.warning(f"AI Provider {provider_name} failed in {duration_ms}ms: {err_msg}. Falling back to next...")
                fallback_history.append({
                    "provider": provider_name,
                    "error": err_msg,
                    "latency_ms": duration_ms
                })

        raise RuntimeError(f"All 4 AI providers failed. History: {fallback_history}")

ai_cascade = AICascadeEngine()
