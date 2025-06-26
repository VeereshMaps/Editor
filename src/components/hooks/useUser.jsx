const colors = ['#958DF1', '#F98181', '#FBBC88', '#FAF594', '#70CFF8', '#94FADB', '#B9F18D']
const getRandomElement = list => list[Math.floor(Math.random() * list.length)]

const getRandomColor = () => getRandomElement(colors)
export const userColor = getRandomColor()

export const useUser = () => {
  const storedUser = JSON.parse(localStorage.getItem("user"));
  console.log("DJJD" + storedUser);
  const userName = storedUser.firstName + ' ' + storedUser.lastName;
  const _id = storedUser._id;
  return {
    name: userName,
    _id: _id,
    color: userColor,
  }
}