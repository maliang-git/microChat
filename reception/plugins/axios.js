/* 开发环境使用的userId与xdyToken */
// const userId =
//   process.env.NODE_ENV === 'development' ? '7887504542812454912' : ''
// const xdyToken =
//   process.env.NODE_ENV === 'development' ? '7918273835747893248' : ''
export default function({ $axios, redirect }) {
  $axios.interceptors.request.use(
    config => {
      config.headers["Content-Type"] = "application/json";
      config.headers["request-origin"] = "WAP";
      return config;
    },
    error => {
      return Promise.reject(error);
    }
  );

  $axios.interceptors.response.use(
    response => {
      const result = response.data;
      const code = result.code;
      if (code === 5223) {
        redirect("/");
      }
      return result;
    },
    error => {
      console.log("err" + error); // for debug
      return Promise.reject(error);
    }
  );
  $axios.onError(error => {
    const code = parseInt(error.response && error.response.status);
    if (code === 400) {
      redirect("/404");
    } else if (code === 500) {
      redirect("/500");
    }
  });
}
