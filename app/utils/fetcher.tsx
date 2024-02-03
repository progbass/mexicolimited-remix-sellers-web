
//
export default async function (
  url: string, 
  options:{ 
    headers?: {
      ["Content-Type"]?:string,
      ["Authorization"]?:string,
      ["Accept"]?:string,
    }, 
    method?:string,
    body?: FormData | string | null | undefined | object,
    credentials?: "include" | "same-origin" | "omit" | undefined,
}={
  body: null,
  credentials: 'include'
}): Promise<any> {

  // NOTE!: This section needs improvement. We apply 'method spoofing' to the request
  // because the Laravel API doesn't support PUT requests with FormData.
  if(
    options?.method === 'PUT'
    // && options?.headers?.["Content-Type"] === 'multipart/form-data'
    && options?.body instanceof FormData
  ) {
    console.log('Spoofing PUT request');
    options.method = 'POST';
    options.body.append('_method', 'PUT');

    // const {["Content-Type"]:contentType, ...restHeaders} = options.headers;
    // options.headers = restHeaders;
  }
  // const user = await AuthService.currentToken()
  // .catch((err) => {
  //   // console.log('err asdjnasd asjknasd asjknasd');
  //   console.log(err);
  //   // return null;
  // })
  // console.log('asdasdasd asldkasd asldkmad, ', user)
  // const user = await AuthService.getCurrentUser({ request }).catch((err) => {
  //   console.log('err asdjnasd asjknasd asjknasd');
  //   console.log(err);
  //   return null;
  // });
  // if(options?.headers?.["Authorization"]){
  //   options.headers["Authorization"] = undefined;
  // }
  // if(options?.headers) {
  //   options.headers["Authorization"] = `Bearer ${user.token || null}`
  // }

  console.log('Initiating Fetcher Call');
  console.log(url, options);

  return fetch(url, options)
    .then(async (res) => {
      
      if(!res.ok){return Promise.reject(await res.json())};
      if (res.error) {
        console.log(res.error);
        throw new Error(res.error);
      }
      return Promise.resolve(res.json());
    })
    .catch((err) => {
      console.error(err);
      // throw new Error(err);
      return Promise.reject(err)
    });
}

//
class Fetcher {
  private token: string;
  constructor(token:string) {
    this.token = token;
  }

  private configRequest = (options:any) => {
    // NOTE!: This section needs improvement. We apply 'method spoofing' to the request
    // because the Laravel API doesn't support PUT requests with FormData.
    if(
      options?.method === 'PUT'
      // && options?.headers?.["Content-Type"] === 'multipart/form-data'
      && options?.body instanceof FormData
    ) {
      console.log('Spoofing PUT request');
      options.method = 'POST';
      options.body.append('_method', 'PUT');
    }

    return options;
  }

  private setAuthorizationHeader = (headers:any) => {
    if(headers?.["Authorization"]){
      headers["Authorization"] = undefined;
    }
    headers["Authorization"] = `Bearer ${this.token || null}`
    return headers;
  }

  private setContentTypeHeader = (headers:any) => {
    if(!headers?.["Content-Type"]){
      console.log('Setting Content-Type Header')
      headers["Content-Type"] = "application/json";
    }
    return headers;
  }

  fetch = async (
    url: string, 
    options:{ 
      headers?: {
        ["Content-Type"]?:string,
        ["Authorization"]?:string,
        ["Accept"]?:string,
      }, 
      method?:string,
      body?: FormData | string | null | undefined | object,
      credentials?: "include" | "same-origin" | "omit" | undefined,
  }) => {
    let {headers = {}, body, ...formattedOptions} = this.configRequest(options) || {};
    headers = this.setAuthorizationHeader(headers);
    //headers = this.setContentTypeHeader(headers);
    console.log('headers ', headers, 'options ', formattedOptions, 'url ', url)

    // Return formatted fetch request
    return fetch(
        url,
        {
          headers: {...headers},
          ...formattedOptions, 
          body: body,
        }
      ).then(async (res) => {
        if(!res.ok){return Promise.reject(await res.json())};
        if (res.error) {
          console.log(res.error);
          throw new Error(res.error);
        }
        return Promise.resolve(res.json());
      })
      .catch((err) => {
        console.error(err);
        // throw new Error(err);
        return Promise.reject(err)
      });
  }
}
export { Fetcher };