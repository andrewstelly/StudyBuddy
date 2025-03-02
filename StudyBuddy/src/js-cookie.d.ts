declare module 'js-cookie' {
    interface CookieAttributes {
      expires?: number | Date | undefined;
      path?: string | undefined;
      domain?: string | undefined;
      secure?: boolean | undefined;
      sameSite?: 'strict' | 'lax' | 'none' | undefined;
    }
  
    interface CookiesStatic<T = string> {
      get(name: string): T | undefined;
      get(): { [key: string]: T };
      set(name: string, value: string | object, options?: CookieAttributes): void;
      remove(name: string, options?: CookieAttributes): void;
    }
  
    const Cookies: CookiesStatic;
    export default Cookies;
  }