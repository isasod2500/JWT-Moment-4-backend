# Backend för Moment 4 - JSON Web Tokens

## [Backend4 - Render](https://dashboard.render.com/web/srv-d7uu84po3t8c73fvmjtg)

# Dokumentation om API

## Länk
https://jwt-moment-4-backend.onrender.com/

Databasen är av NoSQL format, men det finns fyra obligatoriska fält som måste med, markerade med asterisk, se nedan
| Tabellnamn  |  Fält |
|---|---|
| Users |  *username(str), *password(str), firstname(str), surname(str), *email(str), *birthdate(date)  |

## Användning

| Metod  | Ändpunkt  |  Beskrivning |
|---|---|---|
| GET | /api  | Länk för att bekräfta koppling. Visar ej information, endast "API NÅDD"  |
| GET | /signedin  |  Protected route, måste ha giltig token för att nå. | 
| POST  | /register  | POST för formulär om att registrera konto. Validering finns i backend vid fetch.   | 
|  POST | /login   | POST för inloggning. Skickar till backend och databas, jämför användarnamn och hashat lösenord.  | 
| GET  | /secret  | GET för webbplats inuti signedin, "mina sidor". Hämtar information om inloggad användare med token.  | 
