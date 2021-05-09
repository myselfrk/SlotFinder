export const fetchCenterList = async (data) => {
  const endPoint =
    "https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByPin";

  console.log(data);

  const params = Object.keys(data)
    .map((key) => `${key}=${data[key]}`)
    .join("&");

  const res = await fetch(`${endPoint}?${params}`);
  const { centers } = await res.json();
  return centers;
};
