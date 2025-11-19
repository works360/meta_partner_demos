import { db } from "@/lib/db";
import nodemailer from "nodemailer";

export async function POST(req) {
  try {
    const { email, password, confirmPassword, reseller, salesExecutive } = await req.json();

    // ✅ Basic validation
    if (!email || !password || !confirmPassword) {
      return new Response(JSON.stringify({ error: "Please fill in all required fields." }), { status: 400 });
    }
    if (password !== confirmPassword) {
      return new Response(JSON.stringify({ error: "Passwords do not match." }), { status: 400 });
    }

    // ✅ Check for existing user
    const [existing] = await db.query("SELECT id FROM users WHERE username = ?", [email]);
    if (existing.length > 0) {
      return new Response(JSON.stringify({ error: "An account with this email already exists. Try logging in." }), { status: 400 });
    }

    const createdAt = new Date().toISOString().slice(0, 19).replace("T", " ");

    // ✅ Insert new user (plaintext password to match PHP logic)
    const [result] = await db.query(
      "INSERT INTO users (username, password, reseller, sales_executive, created_at) VALUES (?, ?, ?, ?, ?)",
      [email, password, reseller || "", salesExecutive || "", createdAt]
    );

    // ✅ Send welcome email (optional)
    try {
      const transporter = nodemailer.createTransport({
        host: "smtp.hostinger.com",
        port: 465,
        secure: true,
        auth: {
          user: "admin@shiworkspacebuilder.com",
          pass: "Sherlock.holmes1", // ⚠️ Move to env variable
        },
      });

      await transporter.sendMail({
        from: '"Meta Partner Demos" <admin@shiworkspacebuilder.com>',
        to: "ammar@works360.com",
        subject: "Welcome to Partner Demos by Meta",
        html: `
          <div style="font-family: Arial, sans-serif; border:1px solid #ccc; border-radius:6px; padding: 0px; max-width:600px; margin:auto;">
              <h2 style="text-align:center; padding: 25px;">Welcome to Partner Demos by Meta</h2>
              <div style="text-align:center;margin: 35px 0;">
                  <img src="https://orange-sardine-913553.hostingersite.com/assets/images/logo.png" alt="Meta Partner Demos" style="max-width:200px;">
              </div>
              <div style="text-align:left; margin:20px;">
              <p>Welcome to the Partner Demo Program by Meta! You now have access to the program. 
              You can use the following credentials to <a href="https://metapartnerdemos.com/login" target="_blank">login</a>:</p>

              <p><b>Username:</b> ${email}<br>
              <b>Password:</b> ${password}</p>

              <p>You can change your password for your account once you login.</p>
              <p>To learn more about our platform and features, you can download our overview document here: 
              <a href="https://orange-sardine-913553.hostingersite.com/pdf/Meta-Partner-Demos-Overview-Updated1.pdf" target="_blank">Meta Partner Demos Overview</a></p>

              <p>Regards,<br>Partner Demos Team</p>
              </div>
          </div>
        `,
      });
    } catch (emailErr) {
      console.error("Email sending failed:", emailErr);
    }

    // ✅ Return success response
    return new Response(JSON.stringify({ success: true, message: "Registration successful!" }), { status: 200 });
  } catch (err) {
    console.error("Registration error:", err);
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });
  }
}
