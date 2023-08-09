let base_url = 'http://192.168.109.83:5010/app/';
// let base_url = 'http://149.28.78.240:5010/app/';
let _headers = {
  Accept: 'application/json',
  'Content-Type': 'application/json',
};
function createCall(path, data = null, headers = {}, method = 'POST') {
  const merged = {
    ..._headers,
    ...headers,
  };

  let body = {};
  if (data) {
    body = data;
  }

  let strData = JSON.stringify(body);
  if (method == 'POST')
    return fetch(`${base_url}${path}`, {
      method: method,
      headers: merged,
      body: strData,
    }).then((resp) => resp.json());
  else if (method == 'GET')
    return fetch(`${base_url}${path}`, {
      method: method,
      headers: merged,
    }).then((resp) => resp.json());
}

export function client_signup(
  user,
  password,
  email,
  phone,
  country,
  type,
  phone_code,
  kind,
  car_color,
  plate_no,
  face,
  front,
  back,
) {
  let faceImg = face && face.base64 ? face.base64 : null;
  let frontImg = front && front.base64 ? front.base64 : null;
  let backImg = back && back.base64 ? back.base64 : null;
  return createCall(
    'client_signup',
    {
      user,
      password,
      email,
      phone,
      country,
      type,
      phone_code,
      kind,
      car_color,
      plate_no,
      faceImg,
      frontImg,
      backImg,
    },
    null,
  );
}

export function login(user, password, type, token) {
  return createCall('login', { user, password, type, token }, null);
}
export function contactus(email, title, description) {
  return createCall('contactus', { email, title, description }, null);
}

export function get_user_info(id) {
  return createCall('get_user_info', { id }, null);
}

export function update_profile(
  id,
  user,
  password,
  email,
  phone,
  country,
  phone_code,
  kind,
  car_color,
  plate_no,
  face,
  front,
  back,
) {
  let faceImg = face && face.base64 ? face.base64 : null;
  let frontImg = front && front.base64 ? front.base64 : null;
  let backImg = back && back.base64 ? back.base64 : null;
  return createCall(
    'update_profile',
    {
      id,
      user,
      password,
      email,
      phone,
      country,
      phone_code,
      kind,
      car_color,
      plate_no,
      faceImg,
      frontImg,
      backImg,
    },
    null,
  );
}

export function update_payment(id, payment) {
  return createCall('update_payment', { id, payment }, null);
}

export function fetchKey() {
  return createCall('publishable_key', null, null);
}

export function checkout() {
  return createCall('checkout');
}

export function certainOrder(items) {
  return createCall('certain_order', { driver_id: items }, null);
}

export function get_currency() {
  return fetch(
    'http://api.exchangeratesapi.io/latest?symbols=USD,BGN,TRY,RUB,GBP,PHP,MYR,THB&access_key=bb318f870faedd335eb0927c390520c4',
    {},
  ).then((resp) => resp.json());
}

export function support(sender_name, email, title, description) {
  return createCall('support', { sender_name, email, title, description }, null);
}

export async function updateAvatar(avatar) {
  let imgString = avatar.base64;
  return createCall('upload_face_picture', { imgString }, null);
}

export function add_booking(
  user_id,
  distance,
  price,
  currency,
  totalTime,
  bookingList,
) {
  return createCall(
    'add_booking',
    { user_id, distance, price, currency, totalTime, bookingList },
    null,
  );
}

export function get_booking_list(user_id) {
  return createCall('get_booking_list', { user_id }, null);
}

export function get_booking_info(booking_id) {
  return createCall('get_booking_info', { booking_id }, null);
}

export function get_booking_user(user_id) {
  return createCall('get_booking_user', { user_id });
}

export function accept(booking_id, driver_id) {
  return createCall('accept', { booking_id, driver_id }, null);
}

export function decline(booking_id, driver_id) {
  return createCall('decline', { booking_id, driver_id }, null);
}

export function finish(booking_id) {
  return createCall('finish', { booking_id }, null);
}

export function notify(booking_id) {
  return createCall('notify', { booking_id }, null);
}

export function cancel_booking(booking_id) {
  return createCall('cancel_booking', { booking_id }, null);
}

export function set_online(driver_id, on_off) {
  return createCall('set_online', { driver_id, on_off }, null);
}

export function is_favorite_driver(driver_id, user_id) {
  return createCall('is_favorite_driver', { driver_id, user_id }, null);
}

export function is_driver_rating(driver_id, user_id) {
  return createCall('is_driver_rating', { driver_id, user_id }, null);
}

export function rating_driver(driver_id, client_id, star) {
  return createCall('rating_driver', { driver_id, client_id, star }, null);
}

export function favorite_driver(driver_id, client_id) {
  return createCall('favorite_driver', { driver_id, client_id }, null);
}

export function get_driver_list(client_id) {
  return createCall('get_driver_list', { client_id }, null);
}

export function get_driver_ratings(driver_id) {
  return createCall('get_driver_ratings', { driver_id }, null);
}

export function send_chat(message, type, booking_id) {
  return createCall('send_chat', { message, type, booking_id }, null);
}

export function get_driver_list_admin() {
  return createCall('get_driver_list_admin', {}, null);
}

export function get_driver_pay_state(item) {
  return createCall('get_driver_pay_state', { driver_id: item }, null);
}

export function remove_driver(driver_id) {
  return createCall('remove_driver', { driver_id }, null);
}

export function setOnOff(driver_id, on_off) {
  return createCall('setOnOff', { driver_id, on_off }, null);
}

export function forgot(user, password, type) {
  return createCall('forgot', { user, password, type }, null);
}
