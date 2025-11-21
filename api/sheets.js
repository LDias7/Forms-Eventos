import { google } from "googleapis";

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Método não permitido" });
    }

    try {
        const body = req.body;

        // Autenticação com Google Service Account
        const auth = new google.auth.GoogleAuth({
            credentials: {
                client_email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
                private_key: process.env.GOOGLE_SHEETS_PRIVATE_KEY.replace(/\\n/g, '\n')
            },
            scopes: ["https://www.googleapis.com/auth/spreadsheets"]
        });

        const sheets = google.sheets({ version: "v4", auth });

        // Ordenar valores conforme ordem das colunas da planilha
        const orderedValues = Object.values(body);

        await sheets.spreadsheets.values.append({
            spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
            range: "A1",
            valueInputOption: "USER_ENTERED",
            requestBody: {
                values: [orderedValues]
            }
        });

        return res.status(200).json({ message: "Dados salvos com sucesso!" });

    } catch (error) {
        console.error("Erro ao salvar no Google Sheets:", error);
        return res.status(500).json({ error: "Erro ao salvar no Google Sheets" });
    }
}
