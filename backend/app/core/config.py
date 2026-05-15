from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Llama Herd Studio"
    database_url: str = (
        "postgresql+asyncpg://llama:llama@localhost:5432/llama_herd_studio"
    )

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
    )


settings = Settings()
