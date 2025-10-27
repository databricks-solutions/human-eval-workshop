"""FastAPI application for Databricks App Template."""

import os
import time
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

from server.config import ServerConfig
from server.database import create_tables
from server.routers import router


@asynccontextmanager
async def lifespan(app: FastAPI):
  """Manage application lifespan with proper startup and shutdown."""
  print('🚀 Application startup - lifespan function called!')

  # Create database tables on startup
  try:
    print('🔧 Creating database tables on startup...')
    create_tables()
    print('✅ Database tables created successfully')

    # Verify database is working
    from sqlalchemy import text

    from server.database import get_db

    db = next(get_db())
    result = db.execute(text("SELECT name FROM sqlite_master WHERE type='table'"))
    tables = [row[0] for row in result.fetchall()]
    print(f'📊 Database initialized with {len(tables)} tables: {tables}')
    db.close()

  except Exception as e:
    print(f'❌ Failed to create database tables: {e}')
    import traceback

    traceback.print_exc()
    raise e

  print('✅ Application startup complete!')
  yield
  print('🔄 Application shutting down...')


from starlette.middleware.base import BaseHTTPMiddleware


# Request timing middleware
class ProcessTimeMiddleware(BaseHTTPMiddleware):
  """Add process time header to responses for monitoring."""

  async def dispatch(self, request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers['X-Process-Time'] = str(process_time)
    return response


# Error handling middleware
class DatabaseErrorMiddleware(BaseHTTPMiddleware):
  """Handle database connection errors gracefully."""

  async def dispatch(self, request: Request, call_next):
    try:
      return await call_next(request)
    except Exception as e:
      if 'database is locked' in str(e).lower() or 'connection' in str(e).lower():
        return JSONResponse(
          status_code=503,
          content={
            'detail': 'Service temporarily unavailable due to high load. Please try again in a moment.',
            'error_type': 'database_connection_error',
          },
        )
      raise


# Create database tables immediately when the app is imported
print('🚀 Application initialization - creating database tables...')
try:
  create_tables()
  print('✅ Database tables created successfully during app initialization')

  # Verify database is working
  from sqlalchemy import text

  from server.database import get_db

  db = next(get_db())
  result = db.execute(text("SELECT name FROM sqlite_master WHERE type='table'"))
  tables = [row[0] for row in result.fetchall()]
  print(f'📊 Database initialized with {len(tables)} tables: {tables}')
  db.close()

except Exception as e:
  print(f'❌ Failed to create database tables during app initialization: {e}')
  import traceback

  traceback.print_exc()
  # Don't raise the exception to allow the app to start

app = FastAPI(
  title='Databricks App API',
  description='Modern FastAPI application template for Databricks Apps with React frontend',
  version='0.1.0',
  lifespan=lifespan,
)

# Add middleware in order (last added is first executed)
app.add_middleware(DatabaseErrorMiddleware)
app.add_middleware(ProcessTimeMiddleware)
app.add_middleware(GZipMiddleware, minimum_size=1000)  # Compress responses > 1KB

app.add_middleware(
  CORSMiddleware,
  allow_origins=ServerConfig.CORS_ORIGINS,
  allow_credentials=True,
  allow_methods=['*'],
  allow_headers=['*'],
)

app.include_router(router, tags=['api'])


@app.get('/health')
async def health():
  """Health check endpoint."""
  return {'status': 'healthy'}


@app.get('/health/detailed')
async def detailed_health():
  """Detailed health check with database and connection info."""
  from sqlalchemy import text

  from server.database import engine

  try:
    # Test database connection
    with engine.connect() as conn:
      conn.execute(text('SELECT 1'))

    # Get connection pool info
    pool = engine.pool
    pool_info = {
      'size': pool.size(),
      'checked_in': pool.checkedin(),
      'checked_out': pool.checkedout(),
      'overflow': pool.overflow(),
      'invalid': getattr(pool, 'invalid', lambda: 0)(),  # Handle missing invalid method
    }

    return {'status': 'healthy', 'database': 'connected', 'connection_pool': pool_info, 'timestamp': time.time()}
  except Exception as e:
    return {'status': 'unhealthy', 'database': 'disconnected', 'error': str(e), 'timestamp': time.time()}


@app.get('/test')
async def test():
  """Test endpoint."""
  return {'message': 'App is working!'}


# Serve static files from client build directory (must come after API routes)
if os.path.exists('client/build'):
  app.mount('/', StaticFiles(directory='client/build', html=True), name='static')
