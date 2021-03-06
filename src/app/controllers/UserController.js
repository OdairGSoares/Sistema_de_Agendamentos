import * as Yup from 'yup';
import User from "../models/User";

class UserController {
  async store(req, res) {
    
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string().email().required(),
      password: Yup.string().required().min(4),
    });

    if(!(await schema.isValid(req.body))) {
      return res.status(400).json({
        message: 'validation failure'
      });
    }

    const userExists = await User.findOne({
      where: { email: req.body.email },
    });

    if (userExists) {
      return res.status(400).json({
        error: 'This user already exists'
      });
    }

    const { id, name, email , provider } = await User.create(req.body);
    return res.json({
      id,
      name,
      email,
      provider,
    });
  }

  async update(req, res) {
    
    const schema = Yup.object().shape({
      name: Yup.string(),
      email: Yup.string().email(),
      oldPassword: Yup.string().min(4),
      password: Yup.string().min(4).when(
        'oldPassword', (oldPassword, field) => // arrow function without curly braces, has implicit return
        oldPassword ? field.required() : field 
      ),
      confirmPassword: Yup.string().when(
        'password', (password, field) => 
        password ? field.required().oneOf([Yup.ref('password')]) : field)
    });

    if(!(await schema.isValid(req.body))) {
      return res.status(400).json({
        message: 'validation failure'
      });
    }

    const { email, oldPassword } = req.body;

    const user = await User.findByPk(req.userId);
    // console.log(user);

    if(email && email != user.email) {
      const userExists = await User.findOne({
        where: { email },
      });

      if (userExists) {
        return res.status(400).json({
          error: 'This email is already registered'
        });
      }
    }

    if(oldPassword && !(await user.checkPassword(oldPassword))) {
      return res.status(401).json({
        message: 'wrong password'
      })
    }

    const { id, name, provider } = await user.update(req.body);
    
    return res.json({
      id,
      name,
      email,
      provider,
    });
  }
}

export default new UserController();