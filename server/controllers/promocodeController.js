import { Op } from 'sequelize';
import { accountSchema } from '../models/index.js';
import ApiError from '../error/ApiError.js';

const { Promocode, Tariff } = accountSchema;

class promocodeController {
  async getAll(req, res) {
    const schema = 'account';
    let { usePagination, limit, page, sortBy, sortType, search } = req.query;
    usePagination =
      usePagination === (undefined || '') ? true : usePagination === 'true';
    limit = limit || 10;
    page = page || 1;
    sortBy = sortBy || 'id';
    sortType = sortType || 'ASC';
    search = search || '';
    const offset = page * limit - limit;
    let searchCriteria = {};

    if (search) {
      if (!isNaN(search)) {
        searchCriteria = {
          id: parseInt(search),
        };
      } else {
        searchCriteria = { code: { [Op.iLike]: `%${search}%` } };
      }
    }

    const queryOptions = {
      where: searchCriteria,
      order: [[sortBy, sortType]],
      schema,
    };

    if (usePagination) {
      queryOptions.limit = limit;
      queryOptions.offset = offset;
    }

    const promocodes = await Promocode.findAndCountAll(queryOptions);

    return res.json(promocodes);
  }

  async getOne(req, res) {
    const schema = 'account';
    let { id } = req.params;

    const includeOptions = [
      {
        model: Tariff,
        attributes: ['name'],
      },
    ];

    const searchCriteria = { id };

    const queryOptions = {
      where: searchCriteria,
      include: includeOptions,
      schema,
    };

    const promocode = await Promocode.findOne(queryOptions);

    return res.json(promocode);
  }

  async delete(req, res) {
    const schema = 'account';
    const { promocodes } = req.body;
    let ids = [];
    promocodes.forEach((item) => {
      ids.push(item.id);
    });

    await Promocode.destroy({ where: { id: ids }, schema });

    return res.json({ message: 'Удаление произведено успешно.' });
  }
}

export default promocodeController;
