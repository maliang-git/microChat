if (process.client) {
  document.body.addEventListener("focusout", () => {
    /* 
            监听软键盘关闭事件
            解決ios端用微信打开页面，收起软键盘后，底部出现空白问题 
        */
    setTimeout(() => {
      const scrollHeight =
        document.documentElement.scrollTop || document.body.scrollTop || 0;
      window.scrollTo(0, Math.max(scrollHeight - 1, 0));
    }, 100);
  });
}
