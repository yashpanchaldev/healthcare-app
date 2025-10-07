import axios from "axios";
import "../../routes/auth.js";
import { Base } from "../../service/base.js";
import MailService from "../../service/mail.js";

export default class AuthController extends Base {
  constructor() {
    super();
  }

  async signup(req, res, next) {
    try {
      if(this.varify_req(req,["name","email","password"])){
        return this.send_res(res)
      }
      const {name,email,password} = req.body
      const check = await this.selectOne("SELECT id FROM users WHERE email = ?",[email])
      if (check) {
      this.s = 0;
      this.m = "This email address is already registered.";
      return this.send_res(res);
    }

     // 2. Hash the password and insert the new user
    const hash_password = this.generate_password(password);
  const userId = await this.insert(
  "INSERT INTO users (name, email, password, user_type) VALUES (?, ?, ?, ?)",
  [name, email, hash_password, "patient"]   // default user_type = patient
);

    if (userId) {
      // 3. Generate and store API key and token
      const apikey = this.generate_apikey(userId);
      const token = this.generate_token(userId);

      await this.insert(
        "INSERT INTO user_auth (user_id, apikey, token) VALUES (?, ?, ?)",
        [userId, apikey, token]
      );

      // 4. Get the complete user details to send back
      const get_details = await this.selectOne(
        "SELECT id, user_type,name, email, created_at FROM users WHERE id = ?",
        [userId]
      );
      get_details.user_auth = await this.selectOne(
        "SELECT apikey, token FROM user_auth WHERE user_id = ?",
        [userId]
      );
      
      this.s = 1;
      this.m = "Signup successful!";
      this.r = get_details;
      return this.send_res(res);
    } else {
      return this.send_res(res);
    }



    } catch (err) {
      console.log(err)
      this.err = err.message;
    }
  }

 async login(req, res, next) {
  try {
    if (this.varify_req(req, ["email", "password"])) {
      return this.send_res(res);
    }
    const { email, password } = req.body;

    // 1. Find the user by email
    const user = await this.selectOne(`SELECT * FROM users WHERE email = ?`, [
      email,
    ]);

    if (user) {
      // 2. Check if the password is correct
      const isPasswordCorrect = this.check_password(user.password, password);
      if (isPasswordCorrect) {
        // 3. Get user details and auth info to send back
        const get_details = await this.selectOne(
          "SELECT id, name, email, created_at FROM users WHERE id = ?",
          [user.id]
        );
        get_details.user_auth = await this.selectOne(
          "SELECT apikey, token FROM user_auth WHERE user_id = ?",
          [user.id]
        );

        this.s = 1;
        this.m = "Login successful!";  
        this.r = get_details;
        return this.send_res(res);
      } else {
        this.s = 0;
        this.m = "Incorrect password.";
        return this.send_res(res);
      }
    } else {
      this.s = 0;
      this.m = "Email is not registered.";
      return this.send_res(res);
    }
  } catch (error) {
    this.err = error.message;
    return this.send_res(res);
  }
}


  async googleLogin(req, res) {
    try {
      if (this.varify_req(req, ["access_token"])) {
        return this.send_res(res);
      }

      const { access_token } = req.body;

      // Verify token with Google
      // const googleRes = await axios.get(
      //   `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${access_token}`
      // );

      const { email, name, sub } = googleRes.data;

      // Check if user exists
      let user = await this.selectOne("SELECT * FROM users WHERE email = ?", [email]);

      if (!user) {
        // New user → signup
        const userId = await this.insert(
          "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
          [name, email, "", "patient"] // password empty (social login)
        );

        user = await this.selectOne("SELECT * FROM users WHERE id = ?", [userId]);
      }

      // Generate token
      const token = this.generate_token(user.id);

      this.s = 1;
      this.m = "Google login successful!";
      this.r = { user, token };
      return this.send_res(res);

    } catch (err) {
      console.error(err.response?.data || err.message);
      this.err = "Google token invalid!";
      return this.send_res(res);
    }
  }

   async forgotPass(req, res, next) {
  try {
    if (this.varify_req(req, ["email"])) {
      return this.send_res(res);
    }
    const { email } = req.body;

    // check user exist
    const user = await this.selectOne("SELECT * FROM users WHERE email = ?", [email]);
    if (!user) {
      this.s = 0;
      this.m = "Email not registered!";
      return this.send_res(res);
    }

    // generate OTP
    const secret = process.env.OTP_SECRET || "mySecretKey";
    const otp = Math.floor(100000 + Math.random() * 900000); // 6-digit
    const expiryTimestamp = Date.now() + 5 * 60 * 1000; // 5 min

    const rawData = `${email}${otp}${secret}${expiryTimestamp}`;
    const hash = await this.generateHash(rawData);

    // send email
    const mailService = new MailService();
    await mailService.sendMail({
      to: email,
      subject: "Password Reset OTP - healthCare",
      templateName: "forgotPass",
      data: { email, otp },
    });

    this.s = 1;
    this.m = "OTP sent to your email";
    this.r = {
      hash,
      expiryTimestamp,
    };
    return this.send_res(res);
  } catch (error) {
    this.err = error.message;
    return this.send_res(res);
  }
}


async resetPass(req, res, next) {
  try {
    if (this.varify_req(req, ["otp", "hash", "expiryTimestamp", "newPassword", "email"])) {
      return this.send_res(res);
    }

    let { otp, hash, expiryTimestamp, newPassword, email } = req.body;
    const secret = process.env.OTP_SECRET || "mySecretKey";

    // check expiry
    if (Date.now() > Number(expiryTimestamp)) {
      this.s = 0;
      this.m = "OTP expired!";
      return this.send_res(res);
    }

    // verify hash
    const rawData = `${email}${otp}${secret}${expiryTimestamp}`;
    const isValid = await this.compareHash(rawData, hash);

    if (!isValid) {
      this.s = 0;
      this.m = "Invalid OTP!";
      return this.send_res(res);
    }

    // update new password
    const user = await this.selectOne("SELECT * FROM users WHERE email = ?", [email]);
    if (!user) {
      this.s = 0;
      this.m = "User not found!";
      return this.send_res(res);
    }

    const hash_password = this.generate_password(newPassword);
    await this.update("UPDATE users SET password = ? WHERE id = ?", [hash_password, user.id]);

    // ✅ Expire token immediately after success
    expiryTimestamp = 0;

    // send mail
    const mailService = new MailService();
    await mailService.sendMail({
      to: email,
      subject: "Password Reset Successful - Candleaf",
      templateName: "reset-passmail",
      data: { email }
    });

    this.s = 1;
    this.m = "Password reset successfully!";
    this.d = { expiryTimestamp }; // client ko 0 bhej do
    return this.send_res(res);
  } catch (error) {
    this.err = error.message;
    return this.send_res(res);
  }
}

}
