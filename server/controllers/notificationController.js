import { Op } from 'sequelize';
import { accountSchema } from '../models/index.js';
import ApiError from '../error/ApiError.js';

const { Notification } = accountSchema;

class notificationController {
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
        searchCriteria = {
          [Op.or]: [
            { name: { [Op.iLike]: `%${search}%` } },
            { priority: { [Op.iLike]: `%${search}%` } },
          ],
        };
      }
    }

    const queryOptions = {
      where: searchCriteria,
      order: [[sortBy, sortType]],
      raw: true,
      schema,
    };

    if (usePagination) {
      queryOptions.limit = limit;
      queryOptions.offset = offset;
    }

    const notifications = await Notification.findAndCountAll(queryOptions);

    return res.json(notifications);
  }

  async getOne(req, res) {
    const schema = 'account';
    const { id } = req.params;
    const notification = await Notification.findOne({ where: { id }, schema });
    return res.json(notification);
  }
}

export default notificationController;
