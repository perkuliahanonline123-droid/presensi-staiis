const API_URL =
  "https://script.google.com/macros/s/AKfycbyXHwbUiHQB1k0QmYDGIlt4T_WidAvqsGKcVjwJANE_BTSzej9kNl1MMWIxxcH4sk9jPw/exec";

export class ApiClient {

  static async login(email: string, password: string) {

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "login",
        email,
        password,
      }),
    });

    return await response.json();
  }

  static async getUsers() {

    const response = await fetch(
      `${API_URL}?action=getUsers`
    );

    return await response.json();
  }

}
