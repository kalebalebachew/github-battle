import axios from "axios";

const GH = "https://api.github.com";

export const getUser = async (req, res) => {
  const response = await axios.get(`${GH}/user/${username}/repos`);

  res.json(response.data);
};
