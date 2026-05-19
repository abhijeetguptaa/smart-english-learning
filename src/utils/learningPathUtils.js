export function getPathWithSearch(pathname = '', search = '') {
  return `${pathname}${search || ''}`;
}

export function isLearningPathTaskActive(currentActiveTask, pathname = '', search = '') {
  return Boolean(
    currentActiveTask?.path && getPathWithSearch(pathname, search).includes(currentActiveTask.path),
  );
}

export function finishLearningPathTask({
  currentActiveTask,
  completeTask,
  setActiveTask,
  navigate,
  redirectTo = '/tiny-steps',
}) {
  if (!currentActiveTask) {
    return false;
  }

  completeTask(currentActiveTask.id);
  setActiveTask(null);
  navigate(redirectTo);
  return true;
}

export function exitLearningPathTask({
  currentActiveTask,
  pathname = '',
  search = '',
  setActiveTask,
  navigate,
  redirectTo = '/tiny-steps',
  fallback = -1,
}) {
  if (isLearningPathTaskActive(currentActiveTask, pathname, search)) {
    setActiveTask(null);
    navigate(redirectTo);
    return true;
  }

  navigate(fallback);
  return false;
}
