/* DOM elements */
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");

// Set initial message
chatWindow.textContent = "👋 Hello! How can I help you today?";

/* Handle form submit */
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Get user's question
  const question = userInput.value.trim();
  if (!question) return;

  // Show user's message in the chat window
  chatWindow.innerHTML += `<div class="msg user">${question}</div>`;
  userInput.value = "";

  // Show loading message
  chatWindow.innerHTML += `<div class="msg ai">Thinking...</div>`;
  chatWindow.scrollTop = chatWindow.scrollHeight;

  // Prepare the prompt for the OpenAI API
  const systemPrompt =
    "You are a helpful assistant for L'Oréal. Only answer questions about L'Oréal and its products. If a question is not related to L'Oréal, politely reply: 'Sorry, I can only answer questions about L'Oréal and its products.'";

  // Call our Cloudflare Worker (which securely forwards to OpenAI API)
  const WORKER_URL = "https://gentle-tooth-092d.evanrsc.workers.dev/";

  try {
    const response = await fetch(WORKER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: question },
        ],
      }),
    });

    const data = await response.json();
    // Remove the loading message
    const msgs = document.querySelectorAll(".msg.ai");
    if (msgs.length) msgs[msgs.length - 1].remove();

    // Show the AI's reply
    if (data.choices && data.choices[0] && data.choices[0].message) {
      chatWindow.innerHTML += `<div class="msg ai">${data.choices[0].message.content}</div>`;
    } else {
      chatWindow.innerHTML += `<div class="msg ai">Sorry, I couldn't get a response. Please try again.</div>`;
    }
    chatWindow.scrollTop = chatWindow.scrollHeight;
  } catch (error) {
    // Remove the loading message
    const msgs = document.querySelectorAll(".msg.ai");
    if (msgs.length) msgs[msgs.length - 1].remove();
    chatWindow.innerHTML += `<div class="msg ai">Sorry, there was an error. Please try again.</div>`;
    chatWindow.scrollTop = chatWindow.scrollHeight;
  }
});
