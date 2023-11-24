export const formatDate = (inputDate: string) => {
  const [year, month, day] = inputDate.split("/");
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthAbbreviation = months[parseInt(month, 10) - 1];
  return `${monthAbbreviation} ${parseInt(day, 10)}, ${year}`;
};
