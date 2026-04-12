export function useNavigate() {
  const navigate = (path: string) => {
    console.log(path)
    window.history.pushState({}, '', path);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };
  return navigate;
}