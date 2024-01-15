
import AuthService from "../services/Auth.service";

//
export default async function (
  url: string, 
  options?:{ 
    headers?: {
      ["Content-Type"]?:string,
      ["Authorization"]?:string,
      ["Accept"]?:string,
    }, 
    method?:string,
    body?: FormData | string | null | undefined | object
}): Promise<any> {

  // NOTE!: This section needs improvement. We apply 'method spoofing' to the request
  // because the Laravel API doesn't support PUT requests with FormData.
  if(
    options?.method === 'PUT'
    && options?.headers?.["Content-Type"] === 'multipart/form-data'
    && options?.body instanceof FormData
  ) {
    console.log('Spoofing PUT request');
    options.method = 'POST';
    options.body.append('_method', 'PUT');

    const {["Content-Type"]:contentType, ...restHeaders} = options.headers;
    options.headers = restHeaders;
  }

  // const user = await AuthService.getCurrentUser({ request }).catch((err) => {
  //   console.log(err);
  //   return null;
  // });
  // options.headers = {
  //   Authorization: `Bearer ${currentUser.token}`
  // };

  console.log('Initiating Fetcher Call');
  console.log(url, options);

  return fetch(url, options)
    .then((res) => {
      if (res.error) {
        console.log(res.error);
        throw new Error(res.error);
      }
      return Promise.resolve(res.json());
    })
    .catch((err) => {
      console.error(err);
      throw new Error(err);
    });
}
