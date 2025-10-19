export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const latitude = searchParams.get("lat");
  const longitude = searchParams.get("lon");
  const apiKey = process.env.OPENWEATHER_API_KEY;
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric&lang=ja`;
  const res = await fetch(url);
  const weather = await res.json();
  // console.log(weather)
  return Response.json({ weather });
}
