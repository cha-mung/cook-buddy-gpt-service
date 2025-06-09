// client/src/utils/visitorLogger.js
import axios from 'axios';

function padValue(value) {
  return value < 10 ? "0" + value : value;
}

function getTimeStamp() {
  const date = new Date();
  return `${date.getFullYear()}-${padValue(date.getMonth() + 1)}-${padValue(date.getDate())} ${padValue(date.getHours())}:${padValue(date.getMinutes())}:${padValue(date.getSeconds())}`;
}

function getCookieValue(name) {
  const value = "; " + document.cookie;
  const parts = value.split("; " + name + "=");
  if (parts.length === 2) return parts.pop().split(";").shift();
}

function setCookieValue(name, value, days) {
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  const expires = "; expires=" + date.toUTCString();
  document.cookie = name + "=" + value + expires + "; path=/";
}

function getUVfromCookie() {
  const existing = getCookieValue("user");
  if (existing) return existing;

  const hash = Math.random().toString(36).substring(2, 8).toUpperCase();
  setCookieValue("user", hash, 180);
  return hash;
}

export const logVisitor = (ip) => {
  const urlParams = new URLSearchParams(window.location.search);
  const utm = urlParams.get("utm");

  const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  const data = JSON.stringify({
    id: getUVfromCookie(),
    landingUrl: window.location.href,
    ip: ip,
    referer: document.referrer,
    time_stamp: getTimeStamp(),
    utm: utm,
    device: isMobile ? "mobile" : "desktop"
  });

  const addrScript = 'https://script.google.com/macros/s/AKfycbx5GSp91uLzk0lB0NliR-tmqkuJw7tjllpWZrlYDxowkmRUr-eImqhHEOwxMEWfqFsa0A/exec';

  axios.get(`${addrScript}?action=insert&table=visitors&data=${data}`)
    .then(res => console.log("✅ Visitor Logged:", res.data))
    .catch(err => console.error("❌ Visitor log failed:", err));
};

export const logClick = (buttonName) => {
  const addrScript = 'https://script.google.com/macros/s/AKfycbx5GSp91uLzk0lB0NliR-tmqkuJw7tjllpWZrlYDxowkmRUr-eImqhHEOwxMEWfqFsa0A/exec';
  const data = JSON.stringify({
    id: getUVfromCookie(),
    action: buttonName,
    time_stamp: getTimeStamp()
  });
  axios.get(`${addrScript}?action=insert&table=tab_button&data=${data}`)
    .then(res => console.log("✅ Click Logged:", res.data))
    .catch(err => console.error("❌ Click log failed:", err));
};