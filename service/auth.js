const sessionIdToUserMap = new Map();

function setUser(id, email, role) {
  sessionIdToUserMap.set(id, {email, role});
}

function getUser(id) {
  return sessionIdToUserMap.get(id);
}

function removeSession(id){
  return sessionIdToUserMap.delete(id);
}

module.exports = {
  setUser,
  getUser,
  removeSession
};
