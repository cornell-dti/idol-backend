import axios from 'axios';

const url: string = 'http://localhost:3000/api/message';

export let sendMessage = async (message) => {
  let response = await axios.post(url, message);
  return response;
};
