using AutoMapper;

using API.Models;
using API.DTOs;

public class UserProfile : Profile {
    public UserProfile() {
        CreateMap<User, UserDataDTO>().ReverseMap();
    }
}