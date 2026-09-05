export function getPath() {
  return window.location.pathname;
}

export function navigate(path) {
  if (getPath() === path) {
    return;
  }

  window.history.pushState({}, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

export function replace(path) {
  if (getPath() === path) {
    return;
  }

  window.history.replaceState({}, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
}
