export default function HeaderController($scope, $route, $location, mlaConst) {
  var vm = this;
  let path = $location.path();
  let paths = path.split('/');
  vm.path = paths[1];
}