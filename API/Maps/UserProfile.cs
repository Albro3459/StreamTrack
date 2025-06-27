using AutoMapper;

using API.Models;
using API.DTOs;

public class UserProfile : Profile {
    public UserProfile() {
        CreateMap<User, UserDataDTO>().ReverseMap();

        CreateMap<User, UserMinimalDataDTO>()
            .ForMember(
                dest => dest.GenreNames,
                opt => opt.MapFrom(src => src.Genres.Select(g => g.Name).ToList())
            );
    }
}