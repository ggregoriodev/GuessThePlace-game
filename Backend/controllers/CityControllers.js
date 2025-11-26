// import City from "../models/CityModel.js";

// export const getAllCities = async (req, res, next) => {
//   try {
//     const response = await City.findAll(req.body);

//     if (!response.length) {
//       res.status(404).json("Não foi possivel acessar as cidades");
//     } else {
//       res.json(response);
//     }
//   } catch (error) {
//     res
//       .status(500)
//       .json({ message: "Erro ao buscar cidades", error: error.message });
//   }
// };

// export const createCity = async (req, res, next) => {
//   try {
//     console.log("req recebdio:", req.body);
//     const affectedRows = await City.create(req.body);

//     if (affectedRows == 0) {
//       res.status(404).json("Não foi possivel criar a cidade");
//     } else {
//       res.json({ message: "Cidade criada com sucesso" });
//     }
//   } catch (error) {
//     res.status(500).json({ message: "Erro ao criar cidades" });
//   }
// };

// export const updateCity = async (req, res, next) => {
//   try {
//     const affectedRows = await User.update(req.body, {
//       where: {
//         id: req.params.id,
//       },
//     });
//     if (affectedRows == 0) {
//       res.status(404).json("Não foi possivel atualizar a cidade");
//     } else {
//       res.json({ message: "Cidade atualizada com sucesso" });
//     }
//   } catch (error) {
//     res.status(500).json({ message: "Erro ao atualizar cidades" });
//   }
// };

// export const deleteCity = async (req, res, next) => {
//   try {
//     const affectedRows = await City.destroy({
//       where: {
//         id: req.params.id,
//       },
//     });

//     if (affectedRows == 0) {
//       res.status(404).json("Id não encontrado");
//     } else {
//       res.json({ message: "Cidade deletada com sucesso" });
//     }
//   } catch (error) {
//     res
//       .status(500)
//       .json({ message: "Erro ao deletar cidade", error: error.message });
//   }
// };
