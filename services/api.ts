import axios, { AxiosError } from 'axios'
import { destroyCookie, parseCookies, setCookie } from 'nookies'
import { signOut } from '../contexts/AuthContext';

let isRefreshing = false;
let failedRequestQueue: { onSuccess: (token: string) => void; onFailure: (err: AxiosError<unknown, any>) => void; }[] = [];



export function setupAPIClient(ctx = undefined) {
  
  let cookies = parseCookies(ctx);

 const api = axios.create({
    baseURL:'http://localhost:3333',
    headers: {
      Authorization: `Bearer ${cookies['nextAuthToken']}`
    }
  })
  
  api.interceptors.response.use(response => {
    return response;
  }, ( error: AxiosError) => {
    if(error.response?.status === 401){
      if(error.response.data?.code === 'nextAuthRefreshToken'){
        cookies = parseCookies(ctx);
        const { 'nextAuthRefreshToken': refreshToken } = cookies;
        const originalConfig = error.config;
        
        if(!isRefreshing){
  
          isRefreshing = true;
  
          api.post('refresh', {
            refreshToken,
          }).then(response => {
            const { token } = response.data
    
            setCookie(ctx, "nextAuthToken", token, {
              maxAge: 60 * 60 * 24 * 30, //30 dias
              path: "/",
            });
            setCookie(ctx, "nextAuthRefreshToken", response.data.refreshToken, {
              maxAge: 60 * 60 * 24 * 30, //30 dias
              path: "/",
            });
    
            api.defaults.headers["Authorization"] = `Bearer ${token}`;
  
            failedRequestQueue.forEach(request => request.onSuccess(token))
            failedRequestQueue = [];
          }).catch( err => {
            failedRequestQueue.forEach(request => request.onFailure(err))
            failedRequestQueue = [];

           signOut()
  
            
          }).finally(() => {
            isRefreshing = false
          })
        }
  
        return new Promise((resolve, reject) => {
          failedRequestQueue.push({
              onSuccess: (token: string) => {
                originalConfig.headers['Authorization'] = `Bearer ${token}`;
                resolve(api(originalConfig))
              },
            
            onFailure: (err: AxiosError) => {
                  reject(err)
            }
          })
        })
        
      } else {
         signOut()
      }
    }
  
    return Promise.reject(error)
  })

  return api
}