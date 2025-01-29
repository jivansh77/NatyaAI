import { Resend } from 'resend';

// const resend = new Resend(process.env.RESEND_API_KEY);
const resend = new Resend(re_BUkJqdhv_JD5UBzHtcyzEXnex48acCMsx);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { mentorName, specialization, experience } = req.body;

    const { data, error } = await resend.emails.send({
      from: 'NatyaAI <onboarding@resend.dev>',
      to: ['jivansh777@gmail.com'],
      subject: `Dance Session Scheduled with ${mentorName}`,
      html: `
        <h2>Your Dance Session has been scheduled!</h2>
        <p>Dear Student,</p>
        <p>Your session with ${mentorName} has been confirmed.</p>
        <p>Mentor Details:</p>
        <ul>
          <li>Specialization: ${specialization}</li>
          <li>Experience: ${experience}</li>
        </ul>
        <p>Join your session here: <a href="https://NatyaAI/call">https://NatyaAI/call</a></p>
        <p>Best regards,<br/>NatyaAI Team</p>
      `
    });

    if (error) {
      return res.status(400).json({ error });
    }

    return res.status(200).json({ data });
  } catch (error) {
    return res.status(500).json({ error: 'Error sending email' });
  }
} 