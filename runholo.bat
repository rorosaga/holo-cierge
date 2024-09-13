cd concierge-backend
call .\venv\Scripts\activate
start cmd /k "yarn dev"
cd ..\concierge-frontend
start cmd /k "yarn dev"

