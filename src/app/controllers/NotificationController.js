import User from '../models/User';
import Notifications from '../schema/Notifications';

class NotificationController {
  async index(req, res) {

    const checkIsCollaborator = await User.findOne({
      where: {
        id: req.userId,
        provider: true,
      },
    });

    if(!checkIsCollaborator) {
      return res.status(401).json({
        error: 'Notifications available only for collaborators'
      })
    }

    const notifications = await Notifications.find({
      user: req.userId
    }).sort({
      createdAt: 'desc',
    }).limit(20);

    return res.json(notifications);
  }

  async update(req, res) {

    const notifications = await Notifications.findByIdAndUpdate(
      req.params.id, 
      { read: true },
      { new: true },
    );

    return res.json(notifications);
  }

}

export default new NotificationController();