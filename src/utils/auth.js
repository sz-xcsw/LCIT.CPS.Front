import Cookies from 'js-cookie'

const TokenKey = 'Admin-Token'

export function getToken() {
  return Cookies.get(TokenKey)
}

export function setToken(token, expiresSeconds) {
  return Cookies.set(TokenKey, token, { expires: new Date(new Date().getTime() + expiresSeconds * 1000) })
}

export function removeToken() {
  return Cookies.remove(TokenKey)
}


const TenantKey = 'Abp.TenantId';
export function getTenantId() {
  return Cookies.get(TenantKey)
}

export function setTenantId(tenantId) {
  return Cookies.set(TenantKey, tenantId)
}

export function removeTenantId() {
  return Cookies.remove(TenantKey)
}