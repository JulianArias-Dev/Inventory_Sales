
export function validarLogin(username, password) {
  return username.trim() !== '' && password !== '';
}
