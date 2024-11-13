import router from '@adonisjs/core/services/router'
import AuthController from '#controllers/auth_controller'
import UsersController from '#controllers/users_controller'
import GamesController from '#controllers/games_controller'
import AttacksController from '#controllers/attacks_controller'

router.post('v1/register', [AuthController, 'register'])
router.post('v1/login', [AuthController, 'login'])

router.get('v1/activate/:email', [AuthController, 'activate']).as('activate')

router.get('v1/games', [GamesController, 'games'])
router.post('v1/update-role', [UsersController, 'updateRole'])
router.post('v1/disable-user', [UsersController, 'disableUser'])

router.get('v1/my-games', [GamesController, 'playerGames'])
router.get('v1/waiting-opponent', [GamesController, 'waitingOpponent'])
router.post('v1/create-game', [GamesController, 'createGame'])
router.post('v1/join-game', [GamesController, 'joinGame'])

router.post('v1/attack', [AttacksController, 'attack'])
router.get('v1/my-attacks/:gameId', [AttacksController, 'getUserAttacks'])