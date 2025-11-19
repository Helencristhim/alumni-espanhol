export default async function handler(req, res) {
  // Permitir apenas POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { nome, email, telefone } = req.body;

    // Validar dados
    if (!nome || !email || !telefone) {
      return res.status(400).json({
        success: false,
        error: 'Dados incompletos'
      });
    }

    // Enviar para webhook Clint CRM
    const clintResponse = await fetch(
      'https://functions-api.clint.digital/endpoints/integration/webhook/6bc6bcdd-198e-4de6-af06-50b004d8a062',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nome, email, telefone }),
      }
    );

    const clintData = await clintResponse.json();

    if (clintResponse.ok) {
      return res.status(200).json({
        success: true,
        message: 'Lead enviado com sucesso',
        clintResponse: clintData
      });
    } else {
      return res.status(500).json({
        success: false,
        error: 'Erro ao enviar para Clint CRM',
        details: clintData
      });
    }
  } catch (error) {
    console.error('Erro na API:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      details: error.message
    });
  }
}
