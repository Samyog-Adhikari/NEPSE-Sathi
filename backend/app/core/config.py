from typing import List, Optional
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    environment: str = Field(default="development", pattern="^(development|production|test)$")
    port: int = Field(default=8000)
    supabase_url: str = Field(default="https://nepse-insight-demo.supabase.co")
    supabase_service_role_key: str = Field(default="demo_service_role_key_development_min_32_chars", min_length=32)
    supabase_jwt_secret: str = Field(default="demo_jwt_secret_development_min_32_characters_long", min_length=32)
    cors_origins: str = Field(default="http://localhost:3000,http://localhost:5173")
    
    market_data_provider: str = Field(default="scraper")
    nepse_api_key: Optional[str] = None
    nepse_api_base_url: Optional[str] = None
    
    gemini_api_key: Optional[str] = None
    groq_api_key: Optional[str] = None
    nvidia_nim_api_key: Optional[str] = None
    openrouter_api_key: Optional[str] = None
    
    telegram_bot_token: Optional[str] = None
    telegram_chat_id: Optional[str] = None
    sentry_dsn: Optional[str] = None

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    @property
    def cors_origin_list(self) -> List[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

settings = Settings()
