import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  const { id } = req.query;
  if (!id) {
    return res.status(400).send('Missing id parameter');
  }

  const queryId = String(id).trim().toLowerCase();
  const jsonPath = path.join(process.cwd(), 'database_soga11.json');

  if (!fs.existsSync(jsonPath)) {
    return res.status(500).send('Database file not found');
  }

  try {
    const raw = fs.readFileSync(jsonPath, 'utf8');
    const data = JSON.parse(raw);
    
    // Find matching entity by ID (e.g. HIM-018), Number (e.g. 18 or 018), or Name
    const item = data.find(d => {
      const matchId = d.id && d.id.toLowerCase() === queryId;
      const matchNo = String(d.no) === queryId || String(d.no).padStart(3, '0') === queryId;
      const matchName = d.nama && d.nama.toLowerCase() === queryId;
      return matchId || matchNo || matchName;
    });

    if (item && item.file_surat) {
      const targetUrl = `/Surat_Undangan_Generated/${encodeURIComponent(item.file_surat)}`;
      return res.redirect(302, targetUrl);
    }

    return res.status(404).send(`Surat undangan untuk ID '${id}' tidak ditemukan.`);
  } catch (err) {
    return res.status(500).send('Internal server error: ' + err.message);
  }
}
