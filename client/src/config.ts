// Set this to "local" for localhost or "prod" for EC2
export let ENV = "local";

export const getApiUrl = () => {
  return ENV === "local" 
    ? "http://localhost:5000/api"
    : "http://13.60.148.183:5000/api";
}; 